const mysql = require('mysql2');

const dbConnection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'nodejs_login' // You can write yours
});

module.exports = dbConnection.promise();