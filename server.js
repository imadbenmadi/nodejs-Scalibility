const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const redis = require("redis");
const { Queue } = require("bullmq");
const { emailQueue } = require("./jobs/emailQueue");
const userRoutes = require("./routes/userRoutes");

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(helmet()); // For security headers
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1); // Exit if there's a failure
    }
};
connectDB();

// Redis client for caching
const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
});
redisClient.on("error", (err) => {
    console.log("Redis connection error:", err);
});

// Test Redis connection
(async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis");
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
})();

// Routes
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
