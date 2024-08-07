const Ticket = require("../models/Ticket");
const Agency = require("../models/Agency");
const moment = require('moment-timezone');
const User = require("../models/User");
const Line = require("../models/Line");
const TicketService = require("../services/ticketService");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const City = require("../models/City");
const cron = require("cron");


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

module.exports = {

  registerTicket: async (req, res) => {
    try {
      const selectedDayOfTheWeek = req.body.dayOfWeek;
      const line = await Line.findById(req.body.lineCode);
      console.log({ selectedDayOfTheWeek })
      const ticketData = {
        lineCode: req.body.lineCode,
        time: req.body.time,
        numberOfTickets: 48,
        from: line.from,
        to: line.to,
        stops: req.body.stops,
      };
  
      console.log({stops: req.body.stops})
  
      const generatedTickets = await generateTicketsForNextTwoYears(ticketData || req.body.ticketData, selectedDayOfTheWeek || req.body.selectedDayOfTheWeek);
      if(!generatedTickets) {
        return res.status(500).json("Error while creating lines")
      }

      res.status(200).json("Created");
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Internal error -> " + error });
    }
  },
    
    getTicketById: async (req,res) => {
      try {
        const ticket = await Ticket.findById(req.params.id);
        res.status(200).json(ticket);
      } catch (error) {
        return res.status(500).json(error)
      }
    },

  

    getSingleTicket: async (req, res)=>{ 
      try {
          const ticket = await Ticket.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(req.params.id)
              }
            },
            {
              $lookup: {
                from: 'lines',
                localField: 'lineCode',
                foreignField: '_id',
                as: 'lineCode'
              }
            },
            {
              $unwind: {
                path: '$lineCode',
                preserveNullAndEmptyArrays: true
              }
            },
          ])

          
          if(ticket.length < 1) {
              return res.status(404).json("Bileta nuk u gjet. Provoni perseri!");
          }

          res.status(200).json(ticket[0]);
      } catch (error) {
        res.status(500).json({ message: "Internal error -> " + error });
      }
    },
      
      getAllTicket: async (req,res) => {
        try {
          const all = await Ticket.find({}).populate('lineCode')
          return res.status(200).json(all)
        } catch (error) {
          return res.status(500).json({ message: "Internal error -> " + error });
        }
      },

      getAll: async (req,res) => {
        try {
          const today = moment().format('DD-MM-YYYY');
          const all = await Ticket.find({ date: { $gte: today } });
  
          res.status(200).json(all);
        } catch (error) {
          return res.status(500).json({ message: "Internal error -> " + error });
          
        }
      },

      getAllTicketPagination: async (req,res)=>{ 
        try {
          const page = req.query.page || 0;
          const size = req.query.size || 10;
          const all = await Ticket.find({})
          const today = moment().format('DD-MM-YYYY');

            const allTickets = await Ticket.find({}).populate('lineCode').sort({createdAt: 'desc'})
            res.status(200).json({allTickets,all:all.length});
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal error -> " + error });
        }
      },

      getTicketLinesBasedOnDate: async (req, res) => {
        try {
            let startDate = req.query.startDate;
            let endDate = req.query.endDate;
    
            startDate = new Date(startDate);
            endDate = new Date(endDate);
    
            endDate.setDate(endDate.getDate() + 1);
    
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(0, 0, 0, 0);
    
            startDate = startDate.toISOString();
            endDate = endDate.toISOString();
            console.log({ startDate, endDate });
    
            const allBookings = await Booking.find({ departureDate: { $gte: startDate, $lte: endDate } });
            console.log({ allBookings });
            const allLineIDS = req.query.line.split('-');
            let ticketsWithBookings = [];
    
            for (const line of allLineIDS) {
                if (line !== "") {
                    const line_id = new mongoose.Types.ObjectId(line);
                    console.log(line_id);
    
                    const ticketQuery = {
                        date: { $gte: startDate, $lte: endDate },
                        lineCode: line_id
                    };
    
                    const ticketsForLine = await Ticket.find(ticketQuery)
                        .select('-stops') 
                        .populate('lineCode')
                        .sort({ 'date': 'asc' });
    
                    const ticketsForLineWithBookings = ticketsForLine.map((ticket) => {
                        const ticketObject = ticket.toObject();
                        const bookingsForTicket = allBookings.filter(
                            (booking) => booking.ticket.toString() === ticket._id.toString()
                        );
                        return {
                            ticket: ticketObject,
                            bookings: bookingsForTicket
                        };
                    });
    
                    ticketsWithBookings.push(...ticketsForLineWithBookings);
                }
            }
    
            ticketsWithBookings.sort((a, b) => new Date(a.ticket.date) - new Date(b.ticket.date));
            return res.status(200).json(ticketsWithBookings);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal error -> " + error });
        }
    },
    
    

    getSearchedTickets: async (req,res) => {
      try {
        let page = Number(req.query.page) || 1;
        let size = Number(8);
        const skipCount = (page - 1) * size;
    
        const europeBerlinTimezone = 'Europe/Berlin';
        const currentDateFormatted = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        const currentTimeFormatted = moment().format('HH:mm');
        console.log({currentDateFormatted})
        const distinctTicketIds = await Ticket.distinct('_id', {
          $or: [
            {
              'stops.from.code': req.query.from,
              'stops.to.code': req.query.to,
            }
          ]
        });
    
        const uniqueTickets = await Ticket.aggregate([
          {
            $match: {
              _id: { $in: distinctTicketIds },
              date: { $gte: currentDateFormatted },
              numberOfTickets: { $gt: 0 },
              isActive: true
            }
          },
          {
            $sort: { date: 1 },
          },
          {
            $skip: skipCount,
          },
          {
            $limit: size,
          },
        ])
    
        const filteredTickets = uniqueTickets.filter((ticket) => {
          const ticketDateTime = moment(`${findDate(ticket, req.query.from, req.query.to)} ${findMAxBuyingTime(ticket, req.query.from, req.query.to)}`, 'YYYY-MM-DD HH:mm');
          const currentDateTime = moment(`${currentDateFormatted} ${currentTimeFormatted}`, 'YYYY-MM-DD HH:mm').tz(europeBerlinTimezone);
      
          console.log({ ticketDateTime, currentDateTime, isBefore: currentDateTime.isAfter(ticketDateTime) });
      
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

      getNearestTicket: async (req, res) => {
        try {
          const dateNow = moment().format('DD-MM-YYYY');
          const ticket = await Ticket.find({
            from: req.query.from,
            to: req.query.to,
            date: { $gte: dateNow },
          })
            .populate([
              // { path: 'agency', select: '-password', match: { isActive: true } },
              { path: 'lineCode' },
            ])

          if (ticket) {
            res.status(200).json(ticket); 
          } else {
            res.status(404).json({ message: 'No nearest ticket found.' }); 
          }
        } catch (error) {
          res.status(500).json({ message: 'Internal server error -> ' + error });
        }
      },

      deleteTicket: async (req, res) => {
        try {
          const deleteTicket = await Ticket.findByIdAndRemove(req.params.id);
          res.status(200).json({ message: "Linja u fshij me sukses"});
        } catch (error) {
          console.error(error);
          res.status(500).json("error -> " + error);
        }
      },

      editTicket: async (req, res) => {
        try {
          const ticket = await Ticket.findById(req.params.id);

          if (!ticket) {
            return res.status(404).json("Ticket not found");
          }
      
          const editTicket = {
            from: req.body.from ? req.body.from : ticket.from,
            to: req.body.to ? req.body.to : ticket.to,
            date: req.body.date ? req.body.date : ticket.date,
            time: req.body.time ? req.body.time : ticket.time,
            returnDate: req.body.returnDate ? req.body.returnDate : ticket.returnDate,
            returnTime: req.body.returnTime ? req.body.returnTime : ticket.returnTime,
            numberOfTickets: req.body.numberOfTickets ? req.body.numberOfTickets : ticket.numberOfTickets,
            price: req.body.price ? req.body.price : ticket.price,
            childrenPrice: req.body.childrenPrice ? req.body.childrenPrice : ticket.childrenPrice,
            agency: ticket.agency,
            type: req.body.type ? req.body.type : ticket.type,
          }
      
          const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, editTicket);
          res.status(200).json(updatedTicket);
      
        } catch (error) {
          res.status(500).json("Error -> " + error);
        }
      },

      stopSales: async (req,res) => {
          try {
            const deactivated = await Ticket.findByIdAndUpdate(req.params.id, { $set: { isActive: false } })
            res.status(200).json(deactivated );
          } catch (error) {
              res.status(500).json("Error -> " + error);
          }
      },

      allowSales: async (req,res) => {
          try {
            const deactivated = await Ticket.findByIdAndUpdate(req.params.id, { $set: { isActive: true } })
            res.status(200).json(deactivated );
          } catch (error) {
              res.status(500).json("Error -> " + error);
          }
      },

      updateSeats: async (req,res)=> {
        try {
          const newNumberOfTickets = req.body.newNumberOfTickets;
          await Ticket.findByIdAndUpdate(req.params.id, { $set: { numberOfTickets: newNumberOfTickets } })
          res.status(200).json("updated nr. tickets");
        } catch (error) {
          res.status(500).json("Error -> " + error);
        }
      },

      updateReturnSeats: async (req,res)=> {
        try {
          const newNumberOfReturnTickets = req.body.newNumberOfReturnTickets;
          await Ticket.findByIdAndUpdate(req.params.id, { $set: { numberOfReturnTickets: newNumberOfReturnTickets } })
          res.status(200).json("updated nr. tickets");
        } catch (error) {
          res.status(500).json("Error -> " + error);
        }
      },

}

const generateTicketsForNextTwoYears = async (ticketData, selectedDaysOfWeek) => {
  const adjustDayOfWeek = (startDate, dayOfWeek) => {
    const adjustedDate = new Date(startDate);
    adjustedDate.setUTCDate(startDate.getUTCDate() + ((dayOfWeek + 6 - startDate.getUTCDay()) % 7));
    return adjustedDate;
  };

  const tickets = [];

  for (const selectedDayOfWeek of selectedDaysOfWeek) {
    const frankfurtTimezone = 'Europe/Berlin';
    const startDateString = new Date().toLocaleString('en-US', { timeZone: frankfurtTimezone });
    const startDate = new Date(startDateString);
    
    let ticketDate = adjustDayOfWeek(startDate, selectedDayOfWeek);

    for (let i = 0; i < 2 * 52; i++) {
      const ticketDateWithZeroHours = new Date(ticketDate);
      const firstStartHour = ticketData.time.split(":")[0];
      const firstStartMins = ticketData.time.split(":")[1];
      ticketDateWithZeroHours.setUTCHours(parseInt(firstStartHour), parseInt(firstStartMins), 0, 0);

      const ticketDateString = ticketDateWithZeroHours.toISOString();
      const ticketDataWithDate = {
        ...ticketData,
        date: ticketDateString,
      };

      const stopsWithTime = ticketDataWithDate.stops.map((stop) => {
        const stopDate = new Date(ticketDateString);
        const maxBuyingTime = new Date(stopDate);
        const hour = stop.time.split(":")[0];
        const minute = stop.time.split(":")[1];
        stopDate.setUTCHours(parseInt(hour), parseInt(minute), 0, 0);
        mbHours = stop.maxBuyingTime.split(':')[0];
        mbMins = stop.maxBuyingTime.split(':')[1];
        maxBuyingTime.setUTCHours(parseInt(mbHours) + 1, mbMins, 0, 0);

        if (stop.isTomorrow) {
          stopDate.setUTCDate(stopDate.getUTCDate() + 1);
        }

        let arrivalTimeHours = 0;
        let arrivalTimeMinutes = 0;
        let arrivalTimeDate;
        
        if (stop.arrivalTime.includes(':')) {
          arrivalTimeHours = stop.arrivalTime.split(":")[0];
          arrivalTimeMinutes = stop.arrivalTime.split(":")[1];
        } else {
          arrivalTimeHours = parseInt(stop.arrivalTime);
          arrivalTimeMinutes = 0;
        }
        
        const arrivalTimeMilliseconds = arrivalTimeHours * 60 * 60 * 1000 + arrivalTimeMinutes * 60 * 1000;
        arrivalTimeDate = new Date(stopDate.getTime() + arrivalTimeMilliseconds);

        const stopTimestampMilliseconds = stopDate.getTime();
        console.log({stopTimestampMilliseconds, real: new Date(stopTimestampMilliseconds)})
        return {
          ...stop,
          time: stop.time,
          date: stopDate.toISOString(),
          arrivalTimestamp: arrivalTimeDate,
          maxBuyingTime: stop.maxBuyingTime,
          timestamp: stopTimestampMilliseconds 
        };
      });

      const ticketWithStops = {
        ...ticketDataWithDate,
        stops: stopsWithTime,
      };

      tickets.push(ticketWithStops);

      ticketDate.setUTCDate(ticketDate.getUTCDate() + 7);
    }
  }

  await Ticket.insertMany(tickets);
  
  return tickets;
};


const days = [
  { key: "e diel", value: 1 },
  { key: "e hene", value: 2 },
  { key: "e marte", value: 3 },
  { key: "e merkure", value: 4 },
  { key: "e enjte", value: 5 },
  { key: "e premte", value: 6 },
  { key: "e shtune", value: 7 }
];

const createFutureTickets = async () => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const latestTicket = await Ticket.findOne().sort({ date: -1 });

    if (!latestTicket) {
      console.log('No tickets found in the database.');
      return;
    }

    const latestTicketDate = new Date(latestTicket.date);
    const dayOfWeek = latestTicketDate.getUTCDay() + 1

    const futureDate = new Date(latestTicketDate);
    futureDate.setUTCFullYear(futureDate.getUTCFullYear() + 2);

    while (futureDate.getUTCDay() + 1 !== dayOfWeek) {
      futureDate.setUTCDate(futureDate.getUTCDate() + 1);
    }

    const newTicketData = {
      ...latestTicket.toObject(),
      _id: undefined,  
      date: futureDate.toISOString(),
      stops: latestTicket.stops.map(stop => ({
        ...stop,
        date: new Date(new Date(stop.date).getTime() + (futureDate - latestTicketDate)).toISOString(),
        arrivalTimestamp: new Date(new Date(stop.arrivalTimestamp).getTime() + (futureDate - latestTicketDate)).toISOString(),
        timestamp: stop.timestamp + (futureDate - latestTicketDate)
      }))
    };

    await Ticket.create(newTicketData);

    console.log(`Created a new ticket for ${futureDate.toISOString()}`);
  } catch (error) {
    console.error('Error creating future tickets:', error);
  }
};