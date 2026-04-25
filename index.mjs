import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
const session = (await import('express-session')).default;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "superSecretGameGoKey",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
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

function isUserAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect("/");
    }
}

app.use((req, res, next) => {
    res.locals.authenticated = req.session.authenticated || false;
    res.locals.username = req.session.username || "";
    res.locals.isAdmin = req.session.isAdmin || 0;
    next();
});

// Landing page
app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/home');
    } else {
        res.render('landing.ejs');
    }
});

// Sign up page
app.get('/signup', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/home');
    } else {
        res.render('signup.ejs');
    }
});

// Sign up logic
app.post('/signup', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        if (!username || username.trim() == "") {
            let signupError = "Error: username cannot be blank";
            return res.render("signup.ejs", { signupError });
        }

        if (!password || password.trim() == "") {
            let signupError = "Error: password cannot be blank";
            return res.render("signup.ejs", { signupError });
        }

        username = username.trim();

        let sql = `SELECT username
                   FROM users
                   WHERE username = ?`;
        let sqlParams = [username];

        const [rows] = await pool.query(sql, sqlParams);

        if (rows.length > 0) {
            let signupError = "Error: username already exists";
            return res.render("signup.ejs", { signupError });
        }

        let hashedPassword = await bcrypt.hash(password, 10);

        sql = `INSERT INTO users (username, password, is_admin)
               VALUES (?, ?, ?)`;
        sqlParams = [username, hashedPassword, 0];

        await pool.query(sql, sqlParams);

        let signupSuccess = "Account created successfully! Please log in.";
        res.render("landing.ejs", { signupSuccess });

    } catch (err) {
        console.error("Database error:", err);
        let signupError = "Error: database error";
        res.render("signup.ejs", { signupError });
    }
});

// Login logic
app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        if (!username || username.trim() == "") {
            let loginError = "Error: username cannot be blank";
            return res.render("landing.ejs", { loginError });
        }

        if (!password || password.trim() == "") {
            let loginError = "Error: password cannot be blank";
            return res.render("landing.ejs", { loginError });
        }

        username = username.trim();

        let sql = `SELECT id, username, password, is_admin
                   FROM users
                   WHERE username = ?`;
        let sqlParams = [username];

        const [rows] = await pool.query(sql, sqlParams);

        if (rows.length == 0) {
            let loginError = "Error: invalid username or password";
            return res.render("landing.ejs", { loginError });
        }

        let hashedPassword = rows[0].password;
        let match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            let loginError = "Error: invalid username or password";
            return res.render("landing.ejs", { loginError });
        }

        req.session.authenticated = true;
        req.session.userId = rows[0].id;
        req.session.username = rows[0].username;
        req.session.isAdmin = rows[0].is_admin;

        res.redirect('/home');

    } catch (err) {
        console.error("Database error:", err);
        let loginError = "Error: database error";
        res.render("landing.ejs", { loginError });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Home page
app.get('/home', isUserAuthenticated, (req, res) => {
    res.render('home.ejs');
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
app.get('/searchGame', isUserAuthenticated, async (req, res) => {
    let gameTitle = req.query.gameTitle;

    try {
        let url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(gameTitle)}&page_size=10`;

        let response = await fetch(url);
        let data = await response.json();

        res.render('searchResults.ejs', { gameTitle, games: data.results || [] });

    } catch (err) {
        console.error("RAWG API error:", err);
        res.status(500).send("RAWG API error!");
    }
});

// Browse page
app.get('/browse', isUserAuthenticated, async (req, res) => {
    try {
        let today = new Date().toISOString().split("T")[0];
        let yearStart = `${new Date().getFullYear()}-01-01`;

        let popularUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&ordering=-added&page_size=8`;
        let topRatedUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&ordering=-rating&page_size=8`;
        let recentUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${yearStart},${today}&ordering=-released&page_size=8`;

        let [popularResponse, topRatedResponse, recentResponse] = await Promise.all([
            fetch(popularUrl),
            fetch(topRatedUrl),
            fetch(recentUrl)
        ]);

        let popularData = await popularResponse.json();
        let topRatedData = await topRatedResponse.json();
        let recentData = await recentResponse.json();

        let sql = `SELECT title, cover_image, rawg_game_id, status, is_favorite
                   FROM saved_games
                   WHERE user_id = ?
                   AND is_favorite = 1
                   ORDER BY created_at DESC
                   LIMIT 8`;

        let [favoriteGames] = await pool.query(sql, [req.session.userId]);

        res.render('browse.ejs', {
            popularGames: popularData.results || [],
            topRatedGames: topRatedData.results || [],
            recentGames: recentData.results || [],
            favoriteGames
        });

    } catch (err) {
        console.error("Browse page error:", err);
        res.status(500).send("Browse page error!");
    }
});

// Display game info
app.get('/gameInfo', isUserAuthenticated, async (req, res) => {
    let gameId = req.query.gameId;
    let userId = req.session.userId;

    try {
        let url = `https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`;

        let response = await fetch(url);
        let game = await response.json();

        let reviewSql = `SELECT r.id, r.rating, r.review_title, r.review_text, r.created_at, u.username
                         FROM reviews r
                         JOIN users u ON r.user_id = u.id
                         WHERE r.rawg_game_id = ?
                         ORDER BY r.created_at DESC`;

        let savedSql = `SELECT id, rawg_game_id, title, cover_image, genres, status, is_favorite, created_at
                        FROM saved_games
                        WHERE user_id = ?
                        AND rawg_game_id = ?`;

        let [reviews] = await pool.query(reviewSql, [gameId]);
        let [savedRows] = await pool.query(savedSql, [userId, gameId]);

        let savedGame = null;
        if (savedRows.length > 0) {
            savedGame = savedRows[0];
        }

        res.render('game.ejs', { game, reviews, savedGame });

    } catch (err) {
        console.error("RAWG API error:", err);
        res.status(500).send("RAWG API error!");
    }
});

// Save or update game from game page
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
        if (!status || status.trim() == "") {
            return res.json({
                error: "Error: please select a status"
            });
        }

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

// Library page with filters and stats
app.get('/library', isUserAuthenticated, async (req, res) => {
    let userId = req.session.userId;
    let view = req.query.view || "all";
    let status = req.query.status || "";
    let sort = req.query.sort || "newest";
    let libraryMessage = req.query.libraryMessage || "";

    try {
        let whereParts = [`user_id = ?`];
        let sqlParams = [userId];

        if (view == "favorites") {
            whereParts.push(`is_favorite = 1`);
        }

        if (status != "") {
            whereParts.push(`status = ?`);
            sqlParams.push(status);
        }

        let orderBy = `created_at DESC`;
        if (sort == "oldest") {
            orderBy = `created_at ASC`;
        } else if (sort == "title") {
            orderBy = `title ASC`;
        } else if (sort == "status") {
            orderBy = `status ASC, title ASC`;
        }

        let gamesSql = `SELECT id, rawg_game_id, title, cover_image, genres, status, is_favorite, created_at
                        FROM saved_games
                        WHERE ${whereParts.join(" AND ")}
                        ORDER BY ${orderBy}`;

        let statsSql = `SELECT COUNT(*) totalGames,
                               SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) favoriteCount,
                               SUM(CASE WHEN status = 'Want to Play' THEN 1 ELSE 0 END) wantToPlayCount,
                               SUM(CASE WHEN status = 'Playing' THEN 1 ELSE 0 END) playingCount,
                               SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) completedCount,
                               SUM(CASE WHEN status = 'Dropped' THEN 1 ELSE 0 END) droppedCount
                        FROM saved_games
                        WHERE user_id = ?`;

        let [games] = await pool.query(gamesSql, sqlParams);
        let [statsRows] = await pool.query(statsSql, [userId]);

        let stats = statsRows[0];

        res.render('library.ejs', {
            games,
            stats,
            view,
            status,
            sort,
            libraryMessage
        });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

// Update saved game from library page
app.post('/updateSavedGame', isUserAuthenticated, async (req, res) => {
    let savedGameId = req.body.savedGameId;
    let status = req.body.status;
    let genres = req.body.genres;
    let isFavorite = req.body.is_favorite ? 1 : 0;
    let userId = req.session.userId;

    try {
        if (!status || status.trim() == "") {
            return res.redirect('/library?libraryMessage=' + encodeURIComponent('Please select a status.'));
        }

        let sql = `UPDATE saved_games
                   SET status = ?, genres = ?, is_favorite = ?
                   WHERE id = ?
                   AND user_id = ?`;

        let sqlParams = [status, genres, isFavorite, savedGameId, userId];

        await pool.query(sql, sqlParams);

        res.redirect('/library?libraryMessage=' + encodeURIComponent('Saved game updated successfully.'));

    } catch (err) {
        console.error("Database error:", err);
        res.redirect('/library?libraryMessage=' + encodeURIComponent('Database error while updating game.'));
    }
});

// Delete saved game
app.post('/deleteSavedGame', isUserAuthenticated, async (req, res) => {
    let savedGameId = req.body.savedGameId;
    let userId = req.session.userId;

    try {
        let sql = `DELETE FROM saved_games
                   WHERE id = ?
                   AND user_id = ?`;

        await pool.query(sql, [savedGameId, userId]);

        res.redirect('/library?libraryMessage=' + encodeURIComponent('Game removed from library.'));

    } catch (err) {
        console.error("Database error:", err);
        res.redirect('/library?libraryMessage=' + encodeURIComponent('Database error while removing game.'));
    }
});

// Trending page
app.get('/trending', isUserAuthenticated, async (req, res) => {
    try {
        let url = `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=10&maxAge=72`;
        let response = await fetch(url);
        let dealData = await response.json();

        res.render('trending.ejs', { deals: dealData });
    } catch (err) {
        console.error("Error fetching trending games:", err);
        res.status(500).send("Error fetching trending games!");
    }
});

// Adding a review
app.post('/addReview', async (req, res) => {
    if (!req.session.userId) {
        return res.json({
            error: "You must be logged in to add a review."
        });
    }

    let userId = req.session.userId;
    let rawgGameId = req.body.rawg_game_id;
    let rating = parseInt(req.body.rating);
    let reviewTitle = req.body.review_title;
    let reviewText = req.body.review_text;

    try {
        if (!rating || rating < 1 || rating > 5) {
            return res.json({
                error: "Enter a rating between 1 and 5."
            });
        }
        if (!reviewTitle || reviewTitle.trim() === "") {
            return res.json({
                error: "Review title cannot be blank."
            });
        }
        if (!reviewText || reviewText.trim() === "") {
            return res.json({
                error: "Review text cannot be blank."
            });
        }

        let sql = `INSERT INTO reviews
                   (user_id, rawg_game_id, rating, review_title, review_text)
                   VALUES (?, ?, ?, ?, ?)`;
        let sqlParams = [userId, rawgGameId, rating, reviewTitle, reviewText];

        await pool.query(sql, sqlParams);
        res.json({
            success: "Review added"
        });
    } catch (err) {
        console.error("Database error:", err);
        res.json({
            error: "Database error!"
        });
    }
});

app.listen(3000, () => {
    console.log("Express server running");
});