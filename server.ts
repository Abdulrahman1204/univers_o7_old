import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import colors from "colors";
import connectDB from "./config/connectToDb";
import { errorHandler, notFound } from "./middlewares/error";
import authRoutes from "./routes/users_Route/authRoutes";
import userRoutes from "./routes/users_Route/usersRoute";
import profileRoute from "./routes/users_Route/profileRoute";
import classRoute from "./routes/exams_Route/classes_Route/classRoute";
import subjectRoute from './routes/exams_Route/subjects_Route/subjectRoute';
import unitRoute from './routes/exams_Route/units_Route/unitRoute';
import questionRoute from './routes/exams_Route/questions_Route/question_Route'
import examRoute from './routes/exams_Route/exams_Route/exam_Route'
import commentRoute from './routes/exams_Route/comments_Route/commetRoute'
import courseRoute from './routes/courses_Route/courses_Route/coursesRoute'
import qrRoute from './routes/qrPaymentRoute'
import levelRoute from './routes/language_Route/levels_Route/levelRoute'
import LanguageRoute from './routes/language_Route/languages_Route/languageRoute'
import questionLanguageRoute from './routes/language_Route/questions_Route/questionRoute'

import cookieParser from "cookie-parser";

// dotenv
dotenv.config();

// Connection To Db
connectDB();

// Init App
const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Cors Policy
app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true,
  })
);

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("API is running in universe_07");
});

app.use("/api/auth", authRoutes);
app.use("/api/ctrl", userRoutes);
app.use("/api/ctrl", profileRoute);
app.use("/api/exam", classRoute);
app.use("/api/exam", subjectRoute);
app.use("/api/exam", unitRoute);
app.use("/api/exam", questionRoute);
app.use("/api/exam", examRoute);
app.use("/api/exam", commentRoute);
app.use('/api/view', courseRoute);
app.use('/api/language', levelRoute);
app.use('/api/language', LanguageRoute);
app.use('/api/language', questionLanguageRoute);

app.use('/api/qr', qrRoute)

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// Running The Server
const PORT: number = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, () =>
  console.log(
    colors.bold.cyan(
      `🚀 Server is running in ${
        process.env.NODE_ENV || "development"
      } mode on port ${PORT}`
    )
  )
);
