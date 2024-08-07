const Agency = require("../models/Agency");
const moment = require('moment')
const Ticket = require("../models/Ticket");
const Booking = require("../models/Booking");
const bcrypt = require("bcryptjs");
const Token = require("../models/ScannerToken");
const Ceo = require("../models/Ceo");
const { sendAttachmentToAllPassengers, sendAttachmentToOneForAll, generateQRCode, generateQRCodeAgent } = require("../helpers/mail");
const mongoose = require("mongoose");
const City = require("../models/City");
const Line = require("../models/Line");
const crypto = require("crypto")
const { sendOTP } = require('../helpers/mail');



function calculateAge(birthDate) {
  console.log({birthDate});
  const today = new Date();
  const birthDateArray = birthDate.split("-"); 
  const birthDateObj = new Date(
    birthDateArray[2],
    birthDateArray[1] - 1,
    birthDateArray[0]
  );
 
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age -= 1;
  }

  return age;
}



const findPrice = (ticket, from, to) => {
  const stop = ticket?.stops?.find(s => s.from.some(cityInfo => cityInfo.code === from) && s.to.some(t => t.code === to));
  if (stop) {
    return stop.price;
  } else {
    return "Price not found";
  }
};

const findChildrenPrice = (ticket, from, to) => {
  console.log({from, to});
  const stop = ticket?.stops?.find(s => s.from.some(cityInfo => cityInfo.code === from) && s.to.some(t => t.code === to));
  if (stop) {
    return stop.childrenPrice;
  } else {
    return "Children Price not found";
  }
};


const findMAxBuyingTime = (ticket, from, to) => {
  const stop = ticket?.stops?.find(
    (s) =>
      s.from.some((cityInfo) => cityInfo.code === from) &&
      s.to.some((t) => t.code === to)
  );
  if (stop) {
    return stop.maxBuyingTime;
  } else {
    return "Time not found";
  }
};

const findTime = (ticket, from, to) => {
  const stop = ticket?.stops?.find(
    (s) =>
      s.from.some((cityInfo) => cityInfo.code === from) &&
      s.to.some((t) => t.code === to)
  );
  if (stop) {
    return stop.time;
  } else {
    return "Time not found";
  }
};

const findDate = (ticket, from, to) => {
  const stop = ticket.stops.find(
    (s) =>
      s.from.some((cityInfo) => cityInfo.code === from) &&
      s.to.some((t) => t.code === to)
  );
  if (stop) {
    return stop.date;
  } else {
    return "Date not found";
  }
};

const findStation = (ticket, from, to) => {
  const stop = ticket?.stops?.find(
    (s) =>
      s.from[0]?.code == from &&
      s.to[0]?.code == to
  );
  console.log({stopirje: stop.from[0]})
  if (stop) {
    return stop.from[0].city;
  } else {
    return "Station not found";
  }
};


const findStartLat = (ticket,from,to) => {
  const stop = ticket?.stops?.find(s => s.from.some(cityInfo => cityInfo.code === from));
  if (stop) {
    return stop.from[0].lat;
  } else {
    return "Start lat not found";
  }
};

const findStartLng = (ticket,from,to) => {
  const stop = ticket?.stops?.find(s => s.from.some(cityInfo => cityInfo.code === from));
  if (stop) {
    return stop.from[0].lng;
  } else {
    return "Start lng not found";
  }
};

const findEndLat = (ticket,from,to) => {
  const stop = ticket?.stops?.find(s => s.to.some(t => t?.code === to));
  if (stop && stop.to[0]) {
    const dest = stop.to.find((s) => s?.code == to)
    return dest.lat
  } else {
    return "End lat not found";
  }
};

const findEndLng = (ticket,from,to) => {
  const stop = ticket?.stops?.find(s => s.to.some(t => t?.code === to));
  if (stop) {
    const dest = stop.to.find((s) => s?.code == to)
    return dest.lng;
  } else {
    return "End lng not found";
  }
};

function detectPayment(ticket, isPaid) {
  const firstStop = ticket.stops[0];

  if (firstStop) {
    const currentTime = new Date();
    const firstStopTime = new Date(firstStop.date); 
    const timeComponents = firstStop.time.split(':');
    
    firstStopTime.setHours(parseInt(timeComponents[0], 10));
    firstStopTime.setMinutes(parseInt(timeComponents[1], 10));
    
    console.log({ firstStop, currentTime, firstStopTime });
    console.log({difference: firstStopTime.getTime(), difference2: currentTime.getTime(), diff: firstStopTime.getTime() - currentTime.getTime(), time: 24 * 60 * 60 * 1000})

    if (firstStopTime.getTime() - currentTime.getTime() < 24 * 60 * 60 * 1000) {
      return true;
    }
  }

  if (isPaid) {
    return true;
  }

  return false;
}



module.exports = {

  
    createAgency :  async (req,res) => {
        try {
            const hashedPassword = await bcrypt.hashSync(req.body.password, 10);

            const newAgency = new Agency({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                phone: req.body.phone,
                percentage: req.body.percentage,
                city:req.body.city,
                country:req.body.country,
                lines: req.body.lines,
            })

            await newAgency.save();

            return res.status(200).json(newAgency);

        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    },

    loginAsAgency: async (req, res) => {
        try {

            const agency = await Agency.findOne({ email: req.body.email });
            if (!agency) {
                return res.status(401).json({ message: "Invalid Email " });
            }

            if(agency.isActive == false) {
              return res.status(401).json({ message: "Akaunti nuk eshte aktiv, ju lutemi kontaktoni Hak Bus per tu riaktivizuar" });
            }
                
            const validPassword = await bcrypt.compare(
                req.body.password,
                agency.password
            );

            if (!validPassword) {
                return res.status(401).json({data: null, message: "Invalid  Password" });
            }

                const token = agency.generateAuthToken(agency);
                res.set('Authorization', `Bearer ${token}`);

                return res.status(200).json({ data: token, message: "logged in successfully" });
        } catch (error) {
            return res.status(500).send({  message: "Some error happened" + error });
        }
    },

    editAgency: async (req, res) => {
        try {
          const agency = await Agency.findById(req.params.id);
          const hashedPassword = await bcrypt.hashSync(req.body.password, 10);

          const editAgency = {
            name: req.body.name ? req.body.name : agency.name,
            email: req.body.email ? req.body.email : agency.email,
            password: req.body.password ? hashedPassword : agency.password,
            phone: req.body.phone ? req.body.phone : agency.phone,
            percentage: req.body.percentage ? req.body.percentage : agency.percentage,
            city: req.body.city || agency.city,
            country: req.body.country || agency.country,
            lines: req.body.lines || agency.lines,
          }
    
          const updatedAgency = await Agency.findByIdAndUpdate(req.params.id, editAgency);
          res.status(200).json(updatedAgency);
    
        } catch (error) {
          res.status(500).json("error -> " + error);
        }
      },

      getAgencySales: async (req, res) => {
        try {
            const { id } = req.params;
            const fromDate = req.query.fromDate;
            const toDate = req.query.toDate;

            const filteredBookings = await Booking.find({
                seller: id,
                createdAt: { $gte: fromDate, $lte: toDate }
            })
              .populate({
                path: 'buyer',
                select: '-password' 
              })
              .populate({
                path: 'ticket',
                populate: { path: 'lineCode' } 
              }).populate({
                path: 'seller',
                select: '-password'
              })
              .sort({ createdAt: 'desc' });

            res.status(200).json(filteredBookings);
        } catch (error) {
            console.error(error); 
            res.status(500).json({ error: 'An error occurred while fetching agency sales.' });
        }
    },

    getAll: async (req, res) => {
        try {
            const all = await Agency.find({}, "-password").sort({createdAt:'desc'});
            res.status(200).json(all)
        } catch (error) {
          res.status(500).send({ message: "Some error happened" + error });
        }
    },

    deleteAgency: async (req, res) => {
        try {
          console.log({body: req.body})
          const deleteAgency = await Agency.findByIdAndRemove(req.params.id);
          res.status(200).json({ message: "Agjencia u fshi me sukses"});
        } catch (error) {
          console.error(error);
          res.status(500).json("error -> " + error);
        }
      },

      getSingleAgency : async (req,res) => {
        try {
            const agency = await Agency.findById(req.params.id);
            return res.status(200).json(agency)
        } catch (error) {
          res.status(500).json("error -> " + error);
            
        }
      },

      getAgencyTickets : async(req,res) => {
        try {
          const tickets = await Ticket.find({agency:req.params.id}).sort({createdAt:'desc'})
          return res.status(200).json(tickets)
        } catch (error) {
          return res.status(500).json("error -> " + error);
        }
      },

      soldTickets : async(req, res) => {
        try {
            let page = Number(req.query.page) || 1;
            let size = Number(req.query.size) || 10; 
          
            const skipCount = (page - 1) * size;
          
            const soldTickets = await Booking.find({ seller: req.params.id })
              .populate({
                path: 'seller buyer ticket',
                select: '-password'
              })
              .sort({ createdAt: 'desc' })
              .skip(skipCount)
              .limit(size);
          
            return res.status(200).json(soldTickets);
          } catch (error) {
            return res.status(500).json("error -> " + error);
          }
          
      },
      getAgenciesInDebt: async (req, res) => {
        try {
          const { from, to } = req.query;
          
          const agencySales = await Booking.aggregate([
            {
              $match: {
                createdAt: { $gte: new Date(from), $lte: new Date(to) },
                agentHasDebt: true,
                seller: { $ne: null },
              },
            },
            {
              $group: {
                _id: '$seller',
                totalSales: { $sum: '$price' }, 
              },
            },
          ]);
          
          console.log({agencySales})
          const agenciesInDebt = await Agency.find({ _id: { $in: agencySales.map((item) => item._id) } })
            .select('-password -email -country -city -isApplicant -profit -phone -createdAt -updatedAt -company_id -vat -isActive')
            .lean();
      
          const result = agenciesInDebt.map((agency) => {
            const agencySale = agencySales.find((item) => item._id.equals(agency._id));
            const agencyDebt = (agencySale ? agencySale.totalSales : 0) - (agencySale.totalSales * agency.percentage / 100);
            return {
              ...agency,
              totalSales: agencySale ? agencySale.totalSales : 0,
              debt: agencyDebt,
            };
          });
      
          return res.status(200).json(result);
        } catch (error) {
          return res.status(500).json({ error: `Server error -> ${error.message}` });
        }
    },
    
    scanBooking : async (req,res) => {
      try {
          const booking = await Booking.findById(req.params.bookingID);
          console.log(booking);
          
          if(booking.seller != req.params.agencyID) {
              return res.status(401).json("You are not authorized to scan this boking!");
          }
          if(booking.isScanned){
              return res.status(403).json("Booking is already scanned or you are not authorized.")
          } else {
              await Order.findByIdAndUpdate(req.params.bookingID, { $set: { isScanned: true }});
          }

          return res.status(200).json( "Booking scanned successfully!" );
  
      } catch (error) {
          return res.status(500).json(error);   
      }
  },

  createScanningToken : async (req,res) => {
      try {
          const token = new Token({token: req.params.bookingID,ticket:req.params.ticketID})
          await token.save()
          res.status(200).json("token created");
          
      } catch (error) {
          res.status(500).json(error)
      }
  },

  getToken : async (req,res) => {
      try {
          const all = await Token.find({});
          var token = all[all.length -1];
          res.status(200).json(token)
          
      } catch (error) {
          res.status(500).json(error)
      }
  },

  deleteToken: async (req,res) => {
      try {
          await Token.findByIdAndRemove(req.params.token);
          res.status(200).json("deleted")

      } catch (error) {
          res.status(500).json(error)
      }
  },

  getDebtFromDateToDate: async (req, res) => {
    try {
      let debt = 0;
      let bookingIDS = [];
      const agency = await Agency.findById(req.params.id).select('percentage');
      const bookings = await Booking.find({ 
        seller: req.params.id, 
        createdAt: { 
          $gte: req.query.from, 
          $lte: req.query.to 
        },
        agentHasDebt: true,
        isPaid: true,
      }).select('price agentHasDebt seller');
      
      
      for (const booking of bookings) {
        debt += (booking.price) - (booking.price * (agency.percentage / 100));
        bookingIDS.push(booking?._id)
      }
      console.log({bookings, debt})
      
      return res.status(200).json({data: parseFloat(debt.toFixed(2)), bookingIDS: bookingIDS});

    } catch (error) {
        return res.status(500).json(error);
    }

  },

  payDebt: async (req,res) => {
    try {
        const ceo = await Ceo.find({}).limit(1);
        const agency = req.agent.data;
        const { debt, bookingIDS } = req.body;
        const { from, to } = req.query; 
        console.log({bookingIDS, debt})

        if (agency.debt < 1) {
            return res.status(403).json("Agjencioni nuk ka borxhe!");
        }
        if (debt < 1) {
            return res.status(403).json("Ju lutemi shkruani nje numer me te madh se 0");
        }
        // if (debt > agency.debt) {
        //     return res.status(403).json("Shuma e pageses eshte me e madhe se borxhi!");
        // }

        const newNotification = {
            message: `${agency.name} po paguan borxh prej ${debt} € per datat 
            ${from} deri ${to}. Borxhi duhet te konfirmohet ne menyre qe te perditesohet ne dashboardin e agjencionit`,
            title: `Pagese borxhi`,
            agency_id: agency._id,
            value: debt,
            confirmed: false,
            additionalData: bookingIDS
        };
        
        await Ceo.findByIdAndUpdate(ceo[0]._id, { $push: { notifications: newNotification } });

        return res.status(200).json("debt paid")
    } catch (error) {
      console.log(error)
      return res.status(500).json(error);
    }
  },

  getSearchedTickets: async (req,res) => {
    try {
      const europeBerlinTimezone = 'Europe/Berlin';
      const currentDateFormatted = moment().tz(europeBerlinTimezone).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      const currentTimeFormatted = moment().tz(europeBerlinTimezone).format('HH:mm');
      const fromDate = moment(req.query.fromDate).tz(europeBerlinTimezone).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      const toDate = moment(req.query.toDate).tz(europeBerlinTimezone).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      const agency = JSON.parse(req.query.agency);
      
      const agencyLines = agency?.lines?.map((line) => line?.value)
      const distinctTicketIds = await Ticket.distinct('_id', {
        $or: [
          {
            'stops.from.code': req.query.from,
            'stops.to.code': req.query.to,
          }
        ],
        $and: [
          {
            lineCode: { $in: agencyLines }, 
          }
        ]
      });
      
      const uniqueTickets = await Ticket.aggregate([
        {
          $match: {
            _id: { $in: distinctTicketIds },
            date: { $gte: fromDate, $lte: toDate },
            numberOfTickets: { $gt: 0 },
            isActive: true
          }
        },
        {
          $sort: { date: 1 },
        },
      ])
  
      const filteredTickets = uniqueTickets.filter((ticket) => {
        const ticketDateTime = moment(`${findDate(ticket, req.query.from, req.query.to)} ${findTime(ticket, req.query.from, req.query.to)}`, 'YYYY-MM-DD HH:mm');
        const currentDateTime = moment(`${currentDateFormatted} ${currentTimeFormatted}`, 'YYYY-MM-DD HH:mm').tz(europeBerlinTimezone);
    
        return currentDateTime.isAfter(ticketDateTime);
    });
  
      const remainingTickets = uniqueTickets.filter((ticket) => !filteredTickets.includes(ticket));
  
      if (remainingTickets.length == 0) {
        return res.status(204).json("no routes found");
      }
  
      return res.status(200).json(remainingTickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal error -> " + error });
    }
  },


  changePassword: async (req,res) => {
    try {
      const agency = await Agency.findById(req.params.id);
      if (!agency) return res.status(404).json("CEO not found");
  
      const { oldPassword, newPassword, email } = req.body;
  
      const passwordMatches = await bcrypt.compare(oldPassword, agency.password);
      console.log(passwordMatches);
      if (!passwordMatches) return res.status(401).json("wrong old password");
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      console.log(hashedPassword);
  
      if (email) {
        agency.email = email;
      }
      agency.password = hashedPassword;
  
      await agency.save();
  
      const ceoPayload = {
        id: agency._id,
        email: agency.email,
      };
  
      const token = jwt.sign(ceoPayload, process.env.OUR_SECRET);
      return res.status(200).json({ token });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },

  changeEmail: async (req,res) => {
    try {
      console.log(req.params);
      const agency = await Agency.findById(req.params.id);
      agency.email = req.body.email;
      await agency.save();
      agency.password = undefined;
      const agencyPayload = {
        ...agency,
        password: undefined,
      }
      console.log(agencyPayload);

      const token = jwt.sign(agencyPayload, process.env.OUR_SECRET);
      return res.status(200).json(token);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },

  getAgenciesInTotalDebt: async (req,res)=> {
    try {
      const agencies = await Agency.find({ debt: { $gt: 0 } }).select('name debt');
      console.log(agencies)
      return res.status(200).json(agencies)
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' + error });
    }
  },

  confirmBookingPayment: async (req,res) => {
    try {
        const { id,agency_id } = req.params;
        const agency = await Agency.findById(agency_id);
        const booking = await Booking.findByIdAndUpdate(id, { $set: { isPaid: true } }).populate("ticket");
        const destination = { from: booking.from, to: booking.to };
        const dateTime = { date: booking.date, time: findTime(booking.ticket, req.body.from, req.body.to) };
        await generateQRCodeAgent(booking?.map, findStation(booking?.ticket, booking?.fromCode, booking?.toCode), booking._id.toString(), booking.passengers, destination, dateTime, booking.ticket?.lineCode?.freeLuggages, req.body.lng);
        const agencyPercentage = agency.percentage / 100;
        const agencyEarnings = (booking.price * agencyPercentage);
        const debt = booking.price - agencyEarnings;
        console.log({agencyEarnings, debt})
        await Agency.findByIdAndUpdate(agency?._id, { $inc: { debt: debt, profit: agencyEarnings } });

        return res.status(200).json("Successfully confirmed payment"); 

    } catch (error) {
        return res.status(500).json('error -> ' + error)
    }
  },    

  sendBookingAttachment: async (req, res) => {
    try {
        const { sendSepparately, sendToOneEmail, receiverEmail, bookingID } = req.body;
        const attachments = req.files;
        const booking = await Booking.findById(bookingID);

        console.log({body:req.body})
        if (sendSepparately==='true') {
          console.log({sendSepparately})
            await sendAttachmentToAllPassengers( booking.passengers, attachments );
            return res.status(200).json("Dokumentet u dërguan tek secili pasagjer veçmas!")
        } 
        
        if(sendToOneEmail==='true') {
          console.log({sendToOneEmail})
            const isArray = Array.isArray(attachments)
            await sendAttachmentToOneForAll(receiverEmail, booking.passengers, attachments);
            return res.status(200).json(`Dokumentet u dërguan te ${receiverEmail} për ${booking.passengers.length} ${booking.passengers.length > 1 ? 'udhëtarë' : 'udhëtar'} !`);
        }
        
        return res.status(200).json("successfully sent attachments " + attachments)

    } catch (error) {
        console.log(error)
        return res.status(500).json('error -> ' + error)
    }
  },

  makeBookingForCustomers: async (req,res) => {
    try {
      const agency = await Agency.findById(req.params.sellerID);
      if(!agency.isActive) {
        return res.status(401).json("Agent not active")
      }
      const ticket = await Ticket.findById(req.params.ticketID).populate("lineCode");
      const ceo = await Ceo.find({}).limit(1);
      
      
      let totalPrice = 0;
      const passengers = req.body.passengers?.map((passenger) => {
        const age = calculateAge(passenger.birthDate);
        const passengerPrice = age <= 10 ? findChildrenPrice(ticket, req.body.from.code, req.body.to.code) : findPrice(ticket, req.body.from.code, req.body.to.code);
        totalPrice += passengerPrice + (ticket?.lineCode?.luggagePrice * passenger.numberOfLuggages);
        return {
          email: passenger.email,
          phone: passenger.phone,
          fullName: passenger.fullName,
          birthDate: passenger.birthDate,
          age: calculateAge(passenger.birthDate),
          price: passengerPrice,
          numberOfLuggages: passenger.numberOfLuggages,
          luggagePrice: ticket?.lineCode?.luggagePrice * passenger.numberOfLuggages,
        };
      });
      
      const agencyPercentage = agency.percentage / 100;
      const agencyEarnings = (totalPrice * agencyPercentage);
      const ourEarnings = totalPrice - agencyEarnings;
      const depDate = new Date(findDate(ticket, req.body.from.code, req.body.to.code))
      console.log({depDate})

      const newBooking = await new Booking({
        seller: agency?._id,
        ticket: req.params.ticketID,
        lineCode: new mongoose.Types.ObjectId(ticket.lineCode._id),
        date: findDate(ticket, req.body.from.code, req.body.to.code),
        departureDate: depDate,
        from: req.body.from.value,
        to: req.body.to.value,
        fromCode: req.body.from.code,
        toCode: req.body.to.code,
        price: totalPrice,
        passengers: passengers,
        isPaid: detectPayment(ticket, req.body.isPaid),
        agentHasDebt: true,
        map: {
          startLat: findStartLat(ticket,req.body.from.code, req.body.to.code),
          startLng: findStartLng(ticket,req.body.from.code, req.body.to.code),
          endLat: findEndLat(ticket,req.body.from.code, req.body.to.code),
          endLng: findEndLng(ticket,req.body.from.code, req.body.to.code),
        },
      })

      await newBooking.save().then(async () => {
        const psg = newBooking.passengers.length || 1
          await Ticket.findByIdAndUpdate(req.params.ticketID, {
            $inc: { numberOfTickets: -psg },
          });
  
        if(detectPayment(ticket, req.body.isPaid)) {
          await Agency.findByIdAndUpdate(req.params.sellerID, {
            $inc: { totalSales: psg || 1, profit: agencyEarnings, debt: ourEarnings },
          });
        }
      });

      var seatNotification = {};
      if (ticket.numberOfTickets <= ceo[0].nrOfSeatsNotification + 1) {
        seatNotification = {
          type: 'seat',
          message: `Kanë mbetur vetëm ${ceo[0].nrOfSeatsNotification} vende të lira për linjën (${ticket.from} / ${ticket.to}) me datë ${moment(ticket.date).format('DD-MM-YYYY')}`,
          title: `${ceo[0].nrOfSeatsNotification} ulëse të mbetura`,
          ticket_id: ticket._id,
          link: `${process.env.FRONTEND_URL}/ticket/edit/${ticket._id}`,
          confirmed: false,
        };
        await Ceo.findByIdAndUpdate(ceo[0]._id, { $push: { notifications: seatNotification } });
      }


      const destination = { from: req.body.from.value, to: req.body.to.value };
      const dateTime = { date: ticket.date, time: findTime(ticket, req.body.from.code, req.body.to.code) };
      const dateString = findDate(ticket, req.body.from.code, req.body.to.code)
      
      if(detectPayment(ticket, req.body.isPaid)){
        await generateQRCodeAgent(newBooking?.map || {}, findStation(ticket, req.body.from.code, req.body.to.code), newBooking._id.toString(), newBooking.passengers, destination, dateTime,new Date(dateString).toDateString(), ticket?.lineCode?.freeLuggages, req.body.lng);
      }
      return res.status(200).json("success");
    } catch (error) {
      console.log(error);
      return res.status(500).json(`error -> ${error}`);
    }
  },

  applyForCollaboration: async (req,res) =>{
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req?.body?.password, salt);
      console.log({hashedPassword, salt, body: req.body, files: req.file})
      console.log(req.session.cookie);

      const newAgency = new Agency({
          name: req.body.companyName,
          email: req.body.email,
          password: hashedPassword,
          company_id: req.body.companyID,
          address: req.body.address,
          vat: req.body.vatNumber,
          isApplicant: true,
          isActive: false,
      })

      await newAgency.save();

      res.status(201).json(newAgency);

  } catch (error) {
      console.error(error);
      res.status(500).json(error)
  }
  },

  
  sendOtp: async (req, res) => {
    try {
        const otp = generateSixDigitNumber();
        console.log({ otp });

        const user = await Agency.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.otp = otp;
        
        await user.save();
        await sendOTP(user.email, otp )
        console.log(user);
        return res.status(201).json(otp);
      } catch (error) {
          console.log(error);
          return res.status(500).json(error);
      }
  },

    checkOtp: async (req,res) => {
      try {
        const user = await Agency.findOne({ email: req.body.email }).select('otp');
        if(user.otp != req.body.otp){
          return res.status(401).json("Wrong otp");
        }

        return res.status(200).json(true);
      } catch (error) {
        console.log(error);
        return res.status(500).json(error)
      }
    },
    resetPw: async (req, res) => {
      try {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
          const user = await Agency.findOne({ email: req.body.email });
  
          if (!user) {
              return res.status(404).json({ error: "User not found" });
          }
  
          user.password = hashedPassword;
          await user.save();
  
          return res.status(200).json("Success");
      } catch (error) {
          console.log(error);
          return res.status(500).json(error);
      }
  },

}



function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = crypto.randomInt(min, max + 1);
  return randomNumber;
}