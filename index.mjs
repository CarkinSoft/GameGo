import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "k2pdcy98kpcsweia.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "gmhoccg2uue6ds29",
    password: "vvjakq4zu7siihcs",
    database: "nm2pf20notjcum1m",
    connectionLimit: 10,
    waitForConnections: true
});


//routes
app.get('/', (req, res) => {
   res.render('home.ejs', { });
});

// app.get('/searchByLikes', async (req, res) => {
//     let startNum = req.query.startNum;
//     let endNum = req.query.endNum;

//     try {
//         let sql = `SELECT quote, firstName, lastName, likes
//             FROM quotes
//             NATURAL JOIN authors
//             WHERE likes BETWEEN ? AND ?
//             ORDER BY likes`;
//         let sqlParams = [startNum, endNum];;

//         const [rows] = await pool.query(sql, sqlParams);
//         res.render("quotesLikes.ejs", {rows});
//     } catch (err) {
//         console.error("Database error:", err);
//         res.status(500).send("Database error!");
//     }

// });


app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})
