const express = require('express');
const cors = require("cors");
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const { User, Role } = require('./models'); // Import User and Role models
require('dotenv').config();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// 👇 Yaha apne frontend URLs add karo
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://hotel-booking-zeta-two.vercel.app',   // Vercel URL
    'https://hotel-booking-frontend.onrender.com'  // Render URL (agar use kar rahe ho)
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// Preflight requests ke liye
app.options('*', cors());

// Routes
const authRoutes = require("./routes/authRoutes");
const roomRoute = require("./routes/roomRoutes");
const superAdminRoutes = require('./routes/superAdminRoutes');
const hotelRoutes = require("./routes/hotelRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionsRoutes");
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoute);
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
        let superAdminRole = await Role.findOne({ where: { name: "superadmin" } });
        if (!superAdminRole) {
            superAdminRole = await Role.create({ name: "superadmin" });
            console.log("Super Admin role created");
        }

        const existingAdmin = await User.findOne({
            where: { email: SUPER_ADMIN_EMAIL },
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

            await User.create({
                name: SUPER_ADMIN_NAME,
                email: SUPER_ADMIN_EMAIL,
                password: hashedPassword,
                roleId: superAdminRole.id,
            });

            console.log("Super Admin user created");
        } else {
            console.log("Super Admin already exists");
        }
    } catch (error) {
        console.error("Error creating Super Admin:", error);
    }
};

// 404 middleware
app.use((req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    console.error(err.stack);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    createSuperAdmin();
});
