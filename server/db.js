const Pool = require("pg").Pool;

const pool = new Pool(
    {
        user: "tim",
        password: "admin123",
        host: "localhost",
        port: 5432,
        database: "ccms_1"
    }
);

module.exports = pool;

