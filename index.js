const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const bodyParser = require('body-parser');
const WasteCollection = require('./backend/models/WasteCollection');
const optimalRoute = require('./backend/utils/optimalRoute');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://Shifali:admin%40123@cluster0.kuigh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shiffs999@gmail.com',
    pass: 'damnit887',
  },
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Waste Collection API');
});

// 1. Get all waste collection schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await WasteCollection.find();
    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Add a new waste collection schedule
app.post('/api/schedules', async (req, res) => {
  const { date, time, location, emails } = req.body;
  const newSchedule = new WasteCollection({ date, time, location, emails });
  try {
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get schedules for a specific date
app.get('/api/schedules/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const schedules = await WasteCollection.find({ date });
    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Get optimal route
app.get('/api/routes', async (req, res) => {
  try {
    const locations = await WasteCollection.find().select('location');
    const route = optimalRoute(locations);
    res.status(200).json({ route });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cron job to send reminders
cron.schedule('36 10 * * *', async () => {
  console.log('Running reminder cron job...');
  const today = new Date().toISOString().split('T')[0];
  const schedules = await WasteCollection.find({ date: today });
  schedules.forEach(schedule => {
    schedule.emails.forEach(email => {
      const mailOptions = {
        from: 'shiffs999@gmail.com',
        to: email,
        subject: 'Waste Collection Reminder',
        text: `Reminder: Waste collection at ${schedule.location} is scheduled for ${schedule.time}.`,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error(`Error sending email to ${email}:`, err);
        else console.log(`Email sent to ${email}:`, info.response);
      });
    });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
