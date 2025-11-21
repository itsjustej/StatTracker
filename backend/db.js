import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Toyo1207!",
  database: "StatTracker"
});

export default db;
