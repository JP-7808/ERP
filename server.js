import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"; // Import authentication routes
import adminRoutes from "./routes/adminRoutes.js"; // Import admin routes
import salesRoutes from "./routes/salesRoutes.js"; // Import sales routes
import employeeRoutes from "./routes/employeeRoutes.js"; // Import employee routes
import managerRoutes from "./routes/managerRoutes.js"; // Import manager routes

dotenv.config();
const app = express();

// Database Connection
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB Disconnected");
});

// Middleware
app.use(cors({
  origin: "*", 
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);  // Authentication routes
app.use("/api/admin", adminRoutes); // Include admin routes
app.use("/api/sales", salesRoutes); // Include sales routes
app.use("/api/employee", employeeRoutes); // Include employee routes
app.use("/api/manager", managerRoutes); // Include manager routes

const PORT = process.env.PORT || 6600;
app.listen(PORT, () => {
  connect();
  console.log(`Server Running on Port ${PORT}`);
});
