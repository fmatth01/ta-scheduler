/*
 * server.js
 * This file is the entry point for the server
 */

const app = require('./app');

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

}

module.exports = app;