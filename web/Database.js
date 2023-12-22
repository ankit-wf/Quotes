import mysql from 'mysql2'

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Quotes"
})
db.connect(() => {
  try {
    console.log('Connected :)')
  } catch (err) {
    console.log("error aaaa gyaaaa eeee",err);
  }

})
export default db

