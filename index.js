import path from "path";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import { createUser } from "./controllers/userController.js";

dotenv.config({ quiet: true });
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("Hello world"));

app.listen(port, () => console.log(`Server running on port: ${port}`));
