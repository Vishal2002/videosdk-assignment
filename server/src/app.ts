import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './routes/routes';
import { config } from 'dotenv';
config()
const app = express();
const port = process.env.PORT ||8080;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_STRING as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/sessions',router);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling
app.use((err: Error, req: Request, res: Response,next:NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;