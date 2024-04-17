const moment = require("moment");


const generateTicketsForNextTwoYears = async (ticketData, selectedDayOfWeek) => {
    const adjustDayOfWeek = (startDate, dayOfWeek) => {
        const adjustedDate = new Date(startDate);
        adjustedDate.setDate(startDate.getDate() + ((dayOfWeek + 7 - startDate.getDay()) % 7));
        return adjustedDate;
    };
  
    const startDate = new Date();
    const ticketDate = adjustDayOfWeek(startDate, selectedDayOfWeek);
    startDate.setDate(ticketDate.getDate());
    startDate.setHours(8, 0, 0, 0);
  
    const tickets = [];
  
    for (let i = 0; i < 2 * 52; i++) {
        const ticketDateString = moment(ticketDate).subtract(1, 'days').toISOString();
  
        const ticketDataWithDate = {
            ...ticketData,
            date: ticketDateString,
        };
  
        tickets.push(ticketDataWithDate);
  
        ticketDate.setDate(ticketDate.getDate() + 7);
    }
  
    await Ticket.insertMany(tickets);
  
    return tickets;
  };

  const checkForExpiredDocuments = async (docs) => {
    try {
        console.log({docs})
        if (docs.length < 1) { 
            return { message: "No docs found" }; 
        }

        const alertedDocs = []
        const currentDate = moment().startOf('day');
        docs.forEach((doc) => {
            const docDate = moment(doc.expiresAt);
            if (docDate.isSameOrAfter(currentDate)) { 
                console.log("Document expired:", doc._id);
                alertedDocs.push(doc)
            }
            
            console.log("Document not expired:");
        });

        return alertedDocs;
    } catch (error) {
        console.error(error);
        return JSON.stringify(error);
    }
}


module.exports = { generateTicketsForNextTwoYears, checkForExpiredDocuments };