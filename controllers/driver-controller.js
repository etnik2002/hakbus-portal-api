const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs')
const mongoose = require("mongoose")
const { ObjectId } = require('mongodb');
const moment = require('moment/moment');

module.exports = {


    createDriver: async (req,res ) => {
        try {

            const newDriver = new Driver({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                lines: req.body.lines
            })

            await newDriver.save();
            res.status(201).json("created driver")

        } catch (error) {
            res.status(500).json(error)
        }
    },

    getAllDrivers: async (req,res) => {
      try {
        const drivers = await Driver.aggregate([
          {
            $lookup: {
              from: 'bookings',
              localField: 'scannedBookings',
              foreignField: '_id',
              as: 'scannedBookings',
            },
          },
          {
            $lookup: {
              from: 'lines',
              localField: 'lines',
              foreignField: '_id',
              as: 'lines',
            },
          },
        ]).exec();

        res.status(200).json(drivers);
      } catch (error) {
        res.status(500).json(error);
      }
    },

    login: async (req, res) => {
      try {
        const email = req.body.email.toLocaleLowerCase();
        const driver = await Driver.findOne({ email: email });
        if (!driver) {
          return res.status(401).json({ message: "Invalid Email " });
        }
  
        const validPassword = req.body.password === driver.password;
  
        if (!validPassword) {
          return res.status(401).json({ data: null, message: "Invalid  Password" });
        }
  
        const token = driver.generateAuthToken(driver);
        await Driver.findByIdAndUpdate(driver._id, { $set: { fcmToken: req.body.fcmToken } });
        res.setHeader('Authorization', `Bearer ${token}`);
  
        res.status(200).json({ data: token, message: "logged in successfully" });
      } catch (error) {
        res.status(500).send({ message: "Some error happened" + error });
      }
    },

    getDriverById: async (req, res) => {
      try {
        const driver = await Driver.findById(req.params.id);
        const bookings = [];

        await Promise.all(
            driver?.scannedBookings?.map(async (bookingId) => {
                const booking = await Booking.findOne({ 'passengers._id': bookingId }).select('-transaction_id -createdAt -updatedAt -isPaid -fromCode -toCode -date ').populate('ticket buyer');
                if (booking) {
                    bookings.push(booking);
                }
            })
        );

        driver.scannedBookings = [];
        driver.scannedBookings.push(bookings)

        console.log({ bookings });
        return res.status(200).json(driver);
      } catch (error) {
          console.error(error);
          return res.status(500).json(error);
      }
    },


    deleteDriver: async (req,res) => {
        try {
            const deletedDrivers = await Driver.findByIdAndRemove(req.params.id);
            res.status(200).json("driver deleted");
        } catch (error) {
            res.status(500).json(error)
        }
    },

    editDriver: async (req, res) => {
      try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
          return res.status(404).json({ message: 'Driver not found' });
        }
    
        const editedData = {
          name: req.body.name || driver.name,
          email: req.body.email || driver.email,
          password: req.body.password || driver.password,
          code: req.body.code || driver.code,
          lines: req.body.lines || driver.lines,
          scannedBookings: driver.scannedBookings
        };
    
        const edited = await Driver.findByIdAndUpdate(req.params.id, editedData);
        
        res.status(200).json(edited);
      } catch (error) {
        res.status(500).json(error);
      }
    },

    
        scanBooking: async (req, res) => {
          try {
            const driverID = req.params.driverID;
            const bookingID = req.params.bookingID;
            const passengerID = req.params.passengerID;
            var date = moment().format("DD-MM-YYYY");
            
            if (!mongoose.Types.ObjectId.isValid(bookingID)) {
              return res.status(404).json("Rezervimi nuk u gjet! Ju lutemi provoni perseri!");
            }
      
            const driver = await Driver.findById(driverID).populate('lines');
            const booking = await Booking.findById(bookingID).populate({
              path: 'ticket',
              populate: {
                path: 'lineCode',
              },
            });

      
            if (!booking) {
              return res.status(401).json("Rezervimi eshte anuluar ose nuk egziston!");
            }
            
            if (!driver) {
              return res.status(401).json("Ju nuk jeni i autorizuar për të skenuar këtë biletë.");
            }

            if(!booking.isPaid) {
              return res.status(401).json("Bileta nuk eshte paguar!");
            }
            
            const bookingDate = moment(booking?.date).format('DD-MM-YYYY');
            if(bookingDate != date) {
              return res.status(401).json("Data e udhtimit nuk eshte e njejte me daten e sotshme")
            }
      
            const passengerIndex = booking.passengers.findIndex(p => p._id.equals(new mongoose.Types.ObjectId(passengerID)));
            if (passengerIndex === -1) {
              return res.status(404).json("Passenger not found.");
            }

            const isScanned = booking.passengers[passengerIndex].isScanned;
            if(isScanned) {   
              return res.status(410).json("Bileta është skenuar më parë.");
            }

            let isLineMatched = driver.lines.some(line => line._id.equals(booking.ticket.lineCode._id));
            if (!isLineMatched) {
              return res.status(400).json(
                `Linja e biletës (${booking.ticket.lineCode.code}) nuk përputhet me linjën e shoferit. Ju lutemi verifikoni nëse keni hypur në autobusin e duhur.`,
              );
            } else {
              try {
                const hasScannedThis = driver.scannedBookings.some((passenger) => passenger._id.equals(new mongoose.Types.ObjectId(passengerID)))
                if(!hasScannedThis) {
                  await Driver.findByIdAndUpdate(driverID, { $push: { scannedBookings: booking.passengers[passengerIndex]._id } });
                }
                  booking.passengers[passengerIndex].isScanned = true;      
                  await booking.save();
                  return res.status(200).json("Ticket successfully scanned.");
              } catch (error) {
                console.error("Error updating booking: ", error);
                return res.status(500).json("Internal server error -> " + error);
              }
            }

          } catch (error) {
            console.error(error);
            return res.status(500).json("Gabim i brendshëm i serverit.");
          }
      },
      
    
}