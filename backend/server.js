const express = require('express');
const cors = require("cors")
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs');

const { User, Role } = require('./models'); // Import User and Role models
require('dotenv').config();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://hotel-booking-zeta-two.vercel.app',  // ✅ Vercel frontend
    `https://${process.env.RENDER_EXTERNAL_URL || ''}` // Render deployment URL
];
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
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionsRoutes");
const bookingRoutes = require('./routes/bookingRoutes');
const analyticsRoutes = require("./routes/analyticsRoutes")
app.use("/api/analytics", analyticsRoutes);





app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoute);
app.get('/', (req, res) => {
    res.json({
        message: 'Hotel Booking API is running! 🚀',
        status: 'ok',
        timestamp: new Date()
    });
});
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/hotels', hotelRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use('/api/bookings', bookingRoutes);



// ====Creating the Super Admin=====
const createSuperAdmin = async () => {
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
    const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
    const SUPER_ADMIN_NAME = "Super Admin";

    try {
        // 1. Ensure the "Super Admin" role exists
        let superAdminRole = await Role.findOne({ where: { name: "superadmin" } });
        if (!superAdminRole) {
            superAdminRole = await Role.create({ name: "superadmin" });
            console.log("Super Admin role created");
        }

        // 2. Check if super admin user exists
        const existingAdmin = await User.findOne({
            where: { email: SUPER_ADMIN_EMAIL },
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

            await User.create({
                name: SUPER_ADMIN_NAME,
                email: SUPER_ADMIN_EMAIL,
                password: hashedPassword,
                roleId: superAdminRole.id, // ✅ use roleId instead of role string
            });

            console.log(" Super Admin user created");
        } else {
            console.log("Super Admin already exists");
        }
    } catch (error) {
        console.error(" Error creating Super Admin:", error);
    }
};



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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    createSuperAdmin()
});

