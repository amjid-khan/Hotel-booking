const express = require('express');
const cors = require("cors")
const app = express();
const path = require('path');
require('dotenv').config();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// Routes
const authRoutes = require("./routes/authRoutes")
const roomRoute = require("./routes/roomRoutes")
const superAdminRoutes = require('./routes/superAdminRoutes');
const hotelRoutes = require("./routes/hotelRoutes");


app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoute);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/hotels', hotelRoutes);

// app.use("/api/hotel-users", hotelUserRoutes)

// 404 middleware: route nahi mila to error create karo aur next karo
app.use((req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    res.status(404);
    next(error);  // error handling middleware ko bhej diya
});

// Global error handler middleware
app.use((err, req, res, next) => {
    // agar response status already 200 hai to 500 set karo
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    console.error(err.stack);

    res.json({
        message: err.message,
        // stack sirf development mode mein bhejo (optional)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));