import express from 'express';
import dotenv from 'dotenv';
import helperRoutes from './routes/helperRoutes';
import { connectDB } from './config/db';
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

app.use('/api/helpers', helperRoutes);
console.log()
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
