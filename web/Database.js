import mysql from 'mysql2'

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Quotes2.O"
})

db.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
  } else {
    console.log('Connected :)');

    // You can execute your queries or other database operations here
    // For example:
    // db.query('SELECT * FROM your_table', (queryErr, results) => {
    //   if (queryErr) {
    //     console.error('Query error:', queryErr);
    //   } else {
    //     // Process your results here
    //   }
    // });
  }
});

export default db;
