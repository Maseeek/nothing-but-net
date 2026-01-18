export const errorHandler = (err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Handle JWT specific errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
    }

    res.status(statusCode).json({
        error: statusCode === 401 ? 'Unauthorized' : 'Server Error',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/* 
Usage in server.js:
// ... routes ...
app.use(errorHandler);
*/
