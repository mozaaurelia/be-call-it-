import mysql from "mysql2/promise";

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "pengaduan_db",
});

export default connection;

// import mysql from "mysql2/promise";
// import dotenv from "dotenv";

// dotenv.config();

// const connection = await mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   ssl: {
//     minVersion: 'TLSv1.2',
//     rejectUnauthorized: true // Sangat disarankan untuk keamanan
//   }
// });

// export default connection;

