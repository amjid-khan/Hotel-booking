// errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        message: err.message,
        // development mode mein stack bhi bhej sakte ho (optional)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
