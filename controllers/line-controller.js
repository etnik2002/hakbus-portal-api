const Booking = require("../models/Booking");
const Line = require("../models/Line");
const Ticket = require("../models/Ticket");
const moment = require('moment')
const mongoose = require("mongoose")

module.exports = {

    createLine: async (req,res) => {
        try {
            const newLine = new Line({
                code: req.body.code,
                phone:req.body.phone,
                from: req.body.from,
                to: req.body.to,
                lat: req.body.lat,
                lng: req.body.lng,
                endLat: req.body.endLat,
                endLng: req.body.endLng,
                freeLuggages: req.body.freeLuggages,
                luggagePrice: req.body.luggagePrice,
                luggageSize: req.body.luggageSize,
                isNk: req.body.isNk,
            })

            console.log(req.body)

            await newLine.save();
            res.status(200).json("New line created!" + newLine);

        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    },    

    getLineById: async (req,res) => {
      try {
        const line = await Line.findById(req.params.id);
        return res.status(200).json(line)
      } catch (error) {
        res.status(500).json(error);
      }
    },

    getLineTickets: async (req, res) => {
      try {
        const tickets = await Ticket.findOne({ lineCode: req.params.id });
        return res.status(200).json(tickets)
      } catch (error) {
        return res.status(500).json(error)
      }
    },
    
    modifyLineTickets: async (req,res) => {
      try {
        console.log(req.body);
        return res.status(200).json(req.body)
      } catch (error) {
        console.log(error)
        return res.status(500).json(error);
      }
    },

    getAllLines: async (req, res) => {
      try {
        const all = await Line.aggregate([
          { $match: {} },
          { $sort: { createdAt: -1 } }
        ]).exec();

        res.status(200).json(all);
      } catch (error) {
        res.status(500).json("error " + error);
      }
    },  

    getAllLinesNoCache: async (req, res) => {
      try {
        const all = await Line.aggregate([
          { $match: {} },
          { $sort: { createdAt: -1 } }
        ]).exec();

        return res.status(200).json(all);
      } catch (error) {
        return res.status(500).json("error " + error);
      }
    },  


    getLineBookings: async (req, res) => {
      try {
        const lines = await Line.aggregate([{ $match: {} }])
        console.log({lines})
        const bookingsForLine = await Booking.find({})
        .populate({
          path: 'ticket',
          model: 'Ticket', 
          populate: {
            path: 'lineCode',
            model: 'Line', 
          },
        })
        .populate({
          path: 'buyer',
          model: 'User', 
        })
        .sort({ createdAt: -1 })

        const lineBookings = lines.map((line) => {
          const bookings = bookingsForLine.filter((booking) => line.code === booking.ticket.lineCode.code);
          const todaysBookings = bookings.filter((b) => b.ticket.date === moment().format('DD-MM-YYYY') || b.ticket.returnDate === moment().format('DD-MM-YYYY'));
    
          return {
            line: line.code,
            from: line.from,
            to: line.to,
            bookings: bookings,
          };
        });
    
        res.status(200).json(lineBookings);
      } catch (error) {
        res.status(500).json('error -> ' + error);
      }
    },
    
    
    
    findTodaysLineTickets: async (req,res) => {
      try {
        const lines = await Line.aggregate([{ $match: {} }])

        const bookingsForLine = await Booking.find({})
        .populate({
          path: 'ticket',
          model: 'Ticket', 
          populate: {
            path: 'lineCode',
            model: 'Line', 
          },
        })
        .populate({
          path: 'buyer',
          model: 'User', 
        })
        .sort({ createdAt: -1 })

        // const bookingsForLine = await Booking.aggregate([
        //   {
        //     $lookup: {
        //       from: 'tickets',
        //       localField: 'ticket',
        //       foreignField: '_id',
        //       as: 'ticket',
        //     },
        //   },
        //   {
        //     $unwind: '$ticket',
        //   },
        //   {
        //     $lookup: {
        //       from: 'lines',
        //       localField: 'ticket.lineCode',
        //       foreignField: '_id',
        //       as: 'ticket.lineCode',
        //     },
        //   },
        //   {
        //     $unwind: '$ticket.lineCode',
        //   },
        //   {
        //     $lookup: {
        //       from: 'users',
        //       localField: 'buyer',
        //       foreignField: '_id',
        //       as: 'buyer',
        //     },
        //   },
        //   {
        //     $unwind: '$buyer',
        //   },
        //   {
        //     $sort: { createdAt: -1 },
        //   },
        // ]).exec();
    
        const todaysDate = moment(new Date()).format('DD-MM-YYYY');
        const lineBookings = lines.map((line) => {
          const bookings = bookingsForLine.filter((booking) => line.code === booking.ticket.lineCode.code);
          const todaysBookings = bookings.filter((b) => moment(b?.ticket?.date).format('DD-MM-YYYY') === todaysDate || moment(b?.ticket?.returnDate).format('DD-MM-YYYY') === todaysDate);
    
          return {
            line: line.code,
            from: line.from,
            to: line.to,
            bookings: todaysBookings,
          };
        });
    
        res.status(200).json(lineBookings);
      } catch (error) {
        res.status(500).json('error -> ' + error);
      }

    },

      getSingleLineBookings: async (req,res) =>{
        try {
          const all = await Booking.find({
            'ticket': req.params.id,
          }).populate('buyer seller ticket');
          
      
          res.status(200).json(all);
        } catch (error) {
          console.log(error)
          res.status(500).json(error);
        }
      },

      // getSingleLineBookings: async (req,res) =>{
      //   try {
      //     const bookingsForLine = await Booking.find({}).populate({
      //       path: 'ticket',
      //       populate: { path: 'lineCode' }
      //     }).populate({
      //       path: 'buyer',
      //       select: '-password'
      //     }).sort({createdAt: 'desc'})
          
      //     var bookings = [];
      
      //     for (const booking of bookingsForLine) {
      //       if (booking.ticket.lineCode._id == req.params.id && (booking.ticket.date == req.params.from || booking.ticket.returnDate == req.params.from)) {
      //         bookings.push(booking);
      //         console.log(booking)
      //       }
      //     }

      //     console.log(bookings)
      //     res.status(200).json(bookings);
      //   } catch (error) {
      //     res.status(500).json(error);
      //   }
      // },

      deleteLine: async (req,res) => {
        try {
          const deletedLine = await Line.findByIdAndDelete(req.params.id);
  
          const result = await Ticket.deleteMany({ lineCode: req.params.id });
          const count = result.deletedCount || 0;
  
          res.status(200).json(`${count} linja u fshijne te lidhura me ${deletedLine.code}`);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
      },

      deactivateLineTickets: async (req, res) => {
        try {
          if(!req.params.id) {
            return res.status(404).json("Linja nuk u gjet")
          }
          await Line.findByIdAndUpdate(req.params.id, { $set: { isActive: false } })
            const result = await Ticket.updateMany(
                { lineCode: req.params.id }, 
                { $set: { isActive: false } }
            );
            return res.status(200).json(`linjat u deaktivizuan`);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
      },

      activateLineTickets: async (req, res) => {
        try {
            if(!req.params.id) {
              return res.status(404).json("Linja nuk u gjet")
            }
            await Line.findByIdAndUpdate(req.params.id, { $set: { isActive: true } })
            const result = await Ticket.updateMany(
                { lineCode: new mongoose.Types.ObjectId(req.params.id) }, 
                { $set: { isActive: false } }
            );
            return res.status(200).json(`linjat u aktivizuan`);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
      },
    

      editLine: async (req, res) => {
        try {
          const editPayload = req.body;
          const lineId = req.params.id;
      
          const filteredEditPayload = Object.fromEntries(
            Object.entries(editPayload).filter(([key, value]) => value !== undefined && value !== null && value != "" )
          );
      
          await Line.findByIdAndUpdate(lineId, filteredEditPayload);
      
          return res.status(200).json("edited");
        } catch (error) {
          return res.status(500).json(error);
        }
      },
      

}