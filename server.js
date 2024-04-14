const cluster = require("cluster");
const Ticket = require("./models/Ticket");
const { default: fetch } = require("node-fetch");
const Booking = require("./models/Booking");
const { sendBookingCancellationNotification } = require("./helpers/mail");
const { log } = require("console");
const { query } = require("express");
const numCPUs = require("os").cpus().length;

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
  const express = require("express");
  const app = express();
  const mongoose = require("mongoose");
  const cors = require("cors");
  const moment = require("moment")
  const bodyParser = require("body-parser");
  const session = require('express-session');
  const MongoStore = require('connect-mongo');
  const apicache = require("apicache");

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



  app.use(
    express.urlencoded({
      extended: true,
    })
  );


  app.use(
    session({
      secret: process.env.OUR_SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
      }),
    })
  );

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

  // app.post('/send' ,async( req,res) => {
  //   try {
  //     const nodemailer = require("nodemailer")
  //     let transporter = nodemailer.createTransport({
  //       pool: true,
  //       host: "smtp.gmail.com",
  //       port: 465,
  //       secure: true, 
  //       auth: {
  //         user: 'etnikz2002@gmail.com',
  //         pass: 'vysmnurlcmrzcwad',
  //       },
  //     });


  //     return await transporter.sendMail({
  //       from: {
  //         name: 'Hak Bus',
  //         address: 'hakbusticket@gmail.com',
  //       },
  //       to: 'hakbusticket@gmail.com',
  //       subject: 'HakBus Booking Details',
  //       html: `test from new email`
  //     })

  //   } catch (error) {
  //     console.log(error)
  //   }
  // })

  const PORT = process.env.PORT || 4461;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on http://localhost:${PORT}`);
  });
}