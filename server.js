const cluster = require("cluster");
const Ticket = require("./models/Ticket");
const fetch = require("node-fetch");
const Booking = require("./models/Booking");
const { sendBookingCancellationNotification } = require("./helpers/mail");
const { log } = require("console");
const { query } = require("express");
const { checkForExpiredDocuments } = require("./helpers/functions/ticket");
const BusDocument = require("./models/BusDocument");
const numCPUs = require("os").cpus().length;
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); 
  });
  
} else {
  require("dotenv").config();
  const helmet = require("helmet");
  const mongoose = require("mongoose");
  const cors = require("cors");
  const moment = require("moment")
  const bodyParser = require("body-parser");
  const session = require('express-session');
  const MongoStore = require('connect-mongo');
  const userRoutes = require("./routes/user");
  const agencyRoutes = require("./routes/agency");
  const ticketRoutes = require("./routes/ticket");
  const bookingRoutes = require("./routes/booking");
  const lineRoutes = require("./routes/line");
  const driverRoutes = require("./routes/driver");
  const ceoRoutes = require("./routes/ceo");
  const notificationRoutes = require("./routes/notification");
  const docsRoutes = require("./routes/document");
  const axios = require("axios");
  var cookieParser = require('cookie-parser');

  app.use(express.json());
  app.use(bodyParser.json());
  app.use(cors());
  app.use(cookieParser(process.env.OUR_SECRET));
  app.use(helmet());
  
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    secret: process.env.OUR_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
    }),
  }));

  mongoose.connect(process.env.DATABASE_URL)
    .then(() => { console.log("Connected to database!") })
    .catch((err) => { console.log("Connection failed!", err) });

  app.use('/user', userRoutes);
  app.use('/ticket', ticketRoutes);
  app.use('/agency', agencyRoutes);
  app.use('/booking', bookingRoutes);
  app.use('/ceo', ceoRoutes);
  app.use('/driver', driverRoutes);
  app.use('/line', lineRoutes);
  app.use('/notification', notificationRoutes);
  app.use('/docs', docsRoutes);

  const PORT = process.env.PORT || 4461;
  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on http://localhost:${PORT}`);
  });

//   io.on('connection', function(socket) {
//     console.log('Socket connected');

//     socket.on('disconnect', function() {
//       console.log('Socket disconnected');
//     });
//   });

//   setInterval(async () => {
//     try {
//       const docs = await BusDocument.find({ isAlerted: false });
//       const alertedDocs = await checkForExpiredDocuments(docs);
//       if (alertedDocs.length > 0) {
//         const alertsToSend = [];

//         for (const doc of alertedDocs) {
//           const updated = await BusDocument.findByIdAndUpdate(doc._id, { $set: { isAlerted: true } });
//           alertsToSend.push(updated);
//         }
//       }

//       io.emit('notification', { type: 'notification', message: 'New notification', data: alertedDocs });
//       console.log('Notifications sent');
//     } catch (error) {
//       console.error('Error checking for expired documents:', error);
//     }
//   }, 1000 * 60 * 60 * 8);
}
