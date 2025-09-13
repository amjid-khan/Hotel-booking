'use strict';

const { Permission } = require('../models'); // Adjust the path if needed

const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.findAll({
            include: [
                {
                    association: 'roles', // Include related roles if needed
                    attributes: ['id', 'name'], // Only select necessary fields
                    through: { attributes: [] } // Exclude junction table attributes
                }
            ]
        });

        return res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching permissions'
        });
    }
};

module.exports = {
    getAllPermissions
};
