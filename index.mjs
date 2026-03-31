import express from 'express';
import mysql from 'mysql2/promise';
const session = (await import('express-session')).default;
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//for session usage
app.use(session({
    secret: "superSecretGameGoKey",
    resave: false,
    saveUninitialized: false
}));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "k2pdcy98kpcsweia.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "gmhoccg2uue6ds29",
    password: "vvjakq4zu7siihcs",
    database: "nm2pf20notjcum1m",
    connectionLimit: 10,
    waitForConnections: true
});


// Landing page for the site (allows people to login or create an account)
app.get('/', (req, res) => {
    res.render('landing.ejs');
});


// Sign up page
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

// Sign up page logic (allows users to create an account)
app.post('/signup', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        // First checks to see if a username already exists in the database
        let sql = `SELECT username
            FROM users
            WHERE username = ?`;
        let sqlParams = [username];

        const [rows] = await pool.query(sql, sqlParams);

        // If the query returns anything then the username already exists and the account can't be created
        if (rows.length > 0) {
            return res.json({
                success: false,
                message: "Username already exists."
            });
        }

        sql = `INSERT INTO users (username, password, is_admin)
            VALUES (?, ?, ?)`;
        sqlParams = [username, password, 0];

        await pool.query(sql, sqlParams);

        res.json({
            success: true,
            message: "Account created successfully! You can now log in."
        });
    }
    catch (err) {
        console.error("Database error:", err);
        res.status(500).json({
            success: false,
            message: "Database error!"
        });
    }
});

// Collects the user info and checks to make sure that the user exists before creating a session and logging them in
app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        // Checks for the matching user (verifies both password and username match)
        let sql = `SELECT id, username, is_admin
                   FROM users
                   WHERE username = ?
                   AND password = ?`;
        let sqlParams = [username, password];

        const [rows] = await pool.query(sql, sqlParams);

        //If nothing gets returned, then the entered info doesn't belong to a user
        if (rows.length == 0) {
            return res.json({
                success: false,
                message: "Invalid username or password."
            });
        }

        // If a matching user is found, creates the session values
        req.session.userId = rows[0].id;
        req.session.username = rows[0].username;
        req.session.isAdmin = rows[0].is_admin;

        res.json({
            success: true,
            message: "Login successful!"
        });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({
            success: false,
            message: "Database error!"
        });
    }
});

// Route for logging a user out (clears the session and returns them to the landing page)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Logout error!");
        }

        res.redirect('/');
    });
});

// Home page (the actual app page after login)
app.get('/home', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    res.render('home.ejs', { username: req.session.username });
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


app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, username, password, is_admin, created_at FROM users"
        );

        res.send({
            message: "Users table working correctly",
            totalUsers: rows.length,
            users: rows
        });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest



app.listen(3000, ()=>{
    console.log("Express server running")
})
