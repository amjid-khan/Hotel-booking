const express = require('express');
const cors = require("cors")
const app = express();

require('dotenv').config();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',  // ya '*' agar sab allow karna hai (dev mein)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,  // agar cookies/session use kar rahe ho toh
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const hotelRoutes = require("./routes/hotelRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/hotels', hotelRoutes);

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
