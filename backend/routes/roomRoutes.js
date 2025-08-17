const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
    addRoom,
    getAllRooms,
    updateRoom,
    deleteRoom,
} = require('../controllers/roomControllers');

router.post('/rooms',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    upload.single('image'),   // <-- Handle image upload
    addRoom
);

router.get('/rooms',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getAllRooms
);

router.put('/rooms/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    upload.single('image'),   // <-- Handle image upload
    updateRoom
);

router.delete('/rooms/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteRoom
);

module.exports = router;
