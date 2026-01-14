import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import cron from 'node-cron';
import path from 'path';
import { connectDB } from './config/db.js';
import seedAdmin from './config/AdminSeed.js';
import { admin } from './middleware/Auth.js';
import { notFound, errorHandler } from './middleware/Error.js';
import Event from './models/Event.js';
import adminRoute from './routes/Admin.js';
import authRoute from './routes/Auth.js';
import contactRoute from './routes/Contact.js';
import eventRoute from './routes/Event.js';
import joinRoute from './routes/Join.js';
import officeRoute from './routes/Office.js';
import pictureRoute from './routes/Picture.js';
import pvRoute from './routes/Pv.js';
import userRoute from './routes/User.js';

dotenv.config();

const app = express();

connectDB().then(() => {
  seedAdmin();
});

const archivePastEvents = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventsToArchive = await Event.find({
      endDate: { $lt: today },
      archive: false,
      active: true,
    });

    if (eventsToArchive.length > 0) {
      await Event.updateMany(
        { _id: { $in: eventsToArchive.map((event) => event._id) } },
        { $set: { archive: true } }
      );
      console.log(`Archived ${eventsToArchive.length} events.`);
    } else {
      console.log('No events to archive.');
    }
  } catch (error) {
    console.error('Error archiving events:', error);
  }
};

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());
app.use('/Users', express.static(path.join(process.cwd(), 'public/Users')));
app.use('/Offices', express.static(path.join(process.cwd(), 'public/Offices')));

app.use(cors({
  origin: [process.env.FRONTEND_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('Welcome To ENSI Clubs Management App! version : 1.0.0');
});

app.use('/api/admin', admin, adminRoute);
app.use('/api/auth', authRoute);
app.use('/api/contact', contactRoute);
app.use('/api/event', eventRoute);
app.use('/api/join', joinRoute);
app.use('/api/office', officeRoute);
app.use('/api/picture', pictureRoute);
app.use('/api/pv', pvRoute);
app.use('/api/user', userRoute);

// Cron Jobs
cron.schedule('0 0 * * *', () => {
  console.log('Running daily archive task...');
  archivePastEvents();
});

archivePastEvents();

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});