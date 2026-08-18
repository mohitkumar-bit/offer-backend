require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./utils/db");




connectDB();

const app = express();
app.use(express.json());
app.use(morgan("dev"));


app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.get("/health", (req, res) => {
    res.send("server is running....")
})

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/business", require("./routes/businessRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/saved-offers", require("./routes/savedOfferRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});



const PORT = process.env.PORT || 5002;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Offer backend running on http://0.0.0.0:${PORT}`);
});
