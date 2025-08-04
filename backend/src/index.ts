import express from 'express';
import dotenv from 'dotenv';
import helperRoutes from './routes/helperRoutes';
import { connectDB } from './config/db';
import cors from "cors";
import path from 'path';

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/helpers', helperRoutes);
console.log('Routes registered');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
