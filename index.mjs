import express from 'express';
import mysql from 'mysql2/promise';
const session = (await import('express-session')).default;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "superSecretGameGoKey",
    resave: false,
    saveUninitialized: false
}));

const pool = mysql.createPool({
    host: "k2pdcy98kpcsweia.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "gmhoccg2uue6ds29",
    password: "vvjakq4zu7siihcs",
    database: "nm2pf20notjcum1m",
    connectionLimit: 10,
    waitForConnections: true
});

const RAWG_API_KEY = "ae5a2588f0c9456a914d874aeee6c546";

// Landing page
app.get('/', (req, res) => {
    res.render('landing.ejs');
});

// Sign up page
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

// Sign up logic
app.post('/signup', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        if (username == "") {
            return res.json({ error: "Error: username cannot be blank" });
        }

        if (password == "") {
            return res.json({ error: "Error: password cannot be blank" });
        }

        let sql = `SELECT username
                   FROM users
                   WHERE username = ?`;
        let sqlParams = [username];

        const [rows] = await pool.query(sql, sqlParams);

        if (rows.length > 0) {
            return res.json({ error: "Error: username already exists" });
        }

        sql = `INSERT INTO users (username, password, is_admin)
               VALUES (?, ?, ?)`;
        sqlParams = [username, password, 0];

        await pool.query(sql, sqlParams);

        res.json({ success: "Account created successfully!" });
    }
    catch (err) {
        console.error("Database error:", err);
        res.json({ error: "Error: database error" });
    }
});

// Login logic
app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        if (username == "") {
            return res.json({ error: "Error: username cannot be blank" });
        }

        if (password == "") {
            return res.json({ error: "Error: password cannot be blank" });
        }

        let sql = `SELECT id, username, is_admin
                   FROM users
                   WHERE username = ?
                   AND password = ?`;
        let sqlParams = [username, password];

        const [rows] = await pool.query(sql, sqlParams);

        if (rows.length == 0) {
            return res.json({ error: "Error: invalid username or password" });
        }

        req.session.userId = rows[0].id;
        req.session.username = rows[0].username;
        req.session.isAdmin = rows[0].is_admin;

        res.json({ success: "Login successful!" });
    }
    catch (err) {
        console.error("Database error:", err);
        res.json({ error: "Error: database error" });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Logout error!");
        }

        res.redirect('/');
    });
});

// Home page
app.get('/home', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    res.render('home.ejs', { username: req.session.username });
});

// Database test
app.get('/dbTest', async (req, res) => {
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
});

// Search for games
app.get('/searchGame', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    let gameTitle = req.query.gameTitle;

    try {
        let url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(gameTitle)}&page_size=10`;

        let response = await fetch(url);
        let data = await response.json();

        res.render('searchResults.ejs', { gameTitle, games: data.results });

    } catch (err) {
        console.error("RAWG API error:", err);
        res.status(500).send("RAWG API error!");
    }
});

// Display game info
app.get('/gameInfo', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    let gameId = req.query.gameId;

    try {
        let url = `https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`;

        let response = await fetch(url);
        let game = await response.json();

        res.render('game.ejs', { game });

    } catch (err) {
        console.error("RAWG API error:", err);
        res.status(500).send("RAWG API error!");
    }
});

// Save game to library
app.post('/saveGame', async (req, res) => {
    if (!req.session.userId) {
        return res.json({
            error: "You must be logged in to save a game."
        });
    }

    let rawgGameId = req.body.rawg_game_id;
    let title = req.body.title;
    let coverImage = req.body.cover_image;
    let genres = req.body.genres;
    let status = req.body.status;
    let isFavorite = req.body.is_favorite ? 1 : 0;
    let userId = req.session.userId;

    try {
        let sql = `SELECT id
                   FROM saved_games
                   WHERE user_id = ?
                   AND rawg_game_id = ?`;
        let sqlParams = [userId, rawgGameId];

        const [rows] = await pool.query(sql, sqlParams);

        if (rows.length > 0) {
            sql = `UPDATE saved_games
                   SET title = ?,
                       cover_image = ?,
                       genres = ?,
                       status = ?,
                       is_favorite = ?
                   WHERE user_id = ?
                   AND rawg_game_id = ?`;

            sqlParams = [title, coverImage, genres, status, isFavorite, userId, rawgGameId];

            await pool.query(sql, sqlParams);

            return res.json({
                success: "Game updated successfully in your library!"
            });
        }

        sql = `INSERT INTO saved_games
               (user_id, rawg_game_id, title, cover_image, genres, status, is_favorite)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
        sqlParams = [userId, rawgGameId, title, coverImage, genres, status, isFavorite];

        await pool.query(sql, sqlParams);

        res.json({
            success: "Game saved successfully to your library!"
        });

    } catch (err) {
        console.error("Database error:", err);
        res.json({
            error: "Database error!"
        });
    }
});

// Library page
app.get('/library', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    let userId = req.session.userId;

    try {
        let sql = `SELECT id, rawg_game_id, title, cover_image, genres, status, is_favorite, created_at
                   FROM saved_games
                   WHERE user_id = ?
                   ORDER BY created_at DESC`;
        let sqlParams = [userId];

        const [rows] = await pool.query(sql, sqlParams);

        res.render('library.ejs', { games: rows });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.listen(3000, () => {
    console.log("Express server running");
});