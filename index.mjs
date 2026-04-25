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

// Landing page
app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/home');
    } else {
        res.render('landing.ejs', {
            authenticated: false,
            username: ""
        });
    }
});

// Sign up page
app.get('/signup', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/home');
    } else {
        res.render('signup.ejs', {
            authenticated: false,
            username: ""
        });
    }
});

// Sign up logic
app.post('/signup', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        if (!username || username.trim() == "") {
            let signupError = "Error: username cannot be blank";
            return res.render("signup.ejs", {
                signupError,
                authenticated: false,
                username: ""
            });
        }

        if (!password || password.trim() == "") {
            let signupError = "Error: password cannot be blank";
            return res.render("signup.ejs", {
                signupError,
                authenticated: false,
                username: ""
            });
        }

        username = username.trim();

        let sql = `SELECT username
                   FROM users
                   WHERE username = ?`;

        const [rows] = await pool.query(sql, [username]);

        if (rows.length > 0) {
            let signupError = "Error: username already exists";
            return res.render("signup.ejs", {
                signupError,
                authenticated: false,
                username: ""
            });
        }

        let hashedPassword = await bcrypt.hash(password, 10);

        sql = `INSERT INTO users
               (username, password, display_name, profile_image, bio, featured_games, is_admin)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

        let sqlParams = [
            username,
            hashedPassword,
            username,
            "/img/defaultphoto.jpeg",
            "",
            "",
            0
        ];

        await pool.query(sql, sqlParams);

        let signupSuccess = "Account created successfully! Please log in.";
        res.render("landing.ejs", {
            signupSuccess,
            authenticated: false,
            username: ""
        });

    } catch (err) {
        console.error("Database error:", err);
        let signupError = "Error: database error";
        res.render("signup.ejs", {
            signupError,
            authenticated: false,
            username: ""
        });
    }
});

// Login logic
app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        if (!username || username.trim() == "") {
            let loginError = "Error: username cannot be blank";
            return res.render("landing.ejs", {
                loginError,
                authenticated: false,
                username: ""
            });
        }

        if (!password || password.trim() == "") {
            let loginError = "Error: password cannot be blank";
            return res.render("landing.ejs", {
                loginError,
                authenticated: false,
                username: ""
            });
        }

        username = username.trim();

        let sql = `SELECT id, username, password
                   FROM users
                   WHERE username = ?`;

        const [rows] = await pool.query(sql, [username]);

        if (rows.length == 0) {
            let loginError = "Error: invalid username or password";
            return res.render("landing.ejs", {
                loginError,
                authenticated: false,
                username: ""
            });
        }

        let hashedPassword = rows[0].password;
        let match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            let loginError = "Error: invalid username or password";
            return res.render("landing.ejs", {
                loginError,
                authenticated: false,
                username: ""
            });
        }

        req.session.authenticated = true;
        req.session.userId = rows[0].id;
        req.session.username = rows[0].username;

        res.redirect('/home');

    } catch (err) {
        console.error("Database error:", err);
        let loginError = "Error: database error";
        res.render("landing.ejs", {
            loginError,
            authenticated: false,
            username: ""
        });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Home page
app.get('/home', isUserAuthenticated, (req, res) => {
    res.render('home.ejs', {
        authenticated: req.session.authenticated,
        username: req.session.username
    });
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
    let gameTitle = req.query.gameTitle || "";
    let currentPage = parseInt(req.query.page) || 1;
    let pageSize = 12;

    if (currentPage < 1) {
        currentPage = 1;
    }

    try {
        let url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${gameTitle}&page_size=${pageSize}&page=${currentPage}`;

        let response = await fetch(url);
        let data = await response.json();

        let totalPages = Math.ceil((data.count || 0) / pageSize);
        if (totalPages < 1) {
            totalPages = 1;
        }

        res.render('searchResults.ejs', {
            gameTitle,
            games: data.results || [],
            currentPage,
            totalPages,
            authenticated: req.session.authenticated,
            username: req.session.username
        });

    } catch (err) {
        console.error("RAWG API error:", err);
        res.status(500).send("RAWG API error!");
    }
});

// Game page
app.get('/gameInfo', isUserAuthenticated, async (req, res) => {
    let gameId = req.query.gameId;
    let userId = req.session.userId;

    try {
        let url = `https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`;

        let response = await fetch(url);
        let game = await response.json();

        let reviewSql = `SELECT r.id,
                                r.user_id,
                                r.rawg_game_id,
                                r.rating,
                                r.review_title,
                                r.review_text,
                                r.created_at,
                                u.username,
                                u.display_name,
                                u.profile_image
                         FROM reviews r
                         JOIN users u ON r.user_id = u.id
                         WHERE r.rawg_game_id = ?
                         ORDER BY r.created_at DESC`;

        let savedSql = `SELECT id, rawg_game_id, title, cover_image, genres, status, is_favorite, created_at
                        FROM saved_games
                        WHERE user_id = ?
                        AND rawg_game_id = ?`;

        let myReviewSql = `SELECT id, rawg_game_id, rating, review_title, review_text
                           FROM reviews
                           WHERE user_id = ?
                           AND rawg_game_id = ?`;

        let [reviews] = await pool.query(reviewSql, [gameId]);
        let [savedRows] = await pool.query(savedSql, [userId, gameId]);
        let [myReviewRows] = await pool.query(myReviewSql, [userId, gameId]);

        let savedGame = null;
        if (savedRows.length > 0) {
            savedGame = savedRows[0];
        }

        let currentUserReview = null;
        if (myReviewRows.length > 0) {
            currentUserReview = myReviewRows[0];
        }

        res.render('game.ejs', {
            game,
            reviews,
            savedGame,
            currentUserReview,
            userId: req.session.userId,
            authenticated: req.session.authenticated,
            username: req.session.username
        });

    } catch (err) {
        console.error("RAWG API error:", err);
        res.status(500).send("RAWG API error!");
    }
});

// Browse page
app.get('/browse', isUserAuthenticated, async (req, res) => {
    let userId = req.session.userId;

    try {
        let today = new Date().toISOString().split("T")[0];
        let yearStart = `${new Date().getFullYear()}-01-01`;

        let popularUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&ordering=-added&page_size=12`;
        let topRatedUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&ordering=-rating&page_size=12`;
        let recentUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${yearStart},${today}&ordering=-released&page_size=12`;

        let [popularResponse, topRatedResponse, recentResponse] = await Promise.all([
            fetch(popularUrl),
            fetch(topRatedUrl),
            fetch(recentUrl)
        ]);

        let popularData = await popularResponse.json();
        let topRatedData = await topRatedResponse.json();
        let recentData = await recentResponse.json();

        let popularGames = popularData.results || [];
        let topRatedGames = topRatedData.results || [];
        let recentGames = recentData.results || [];

        let savedSql = `SELECT rawg_game_id, genres
                        FROM saved_games
                        WHERE user_id = ?`;

        let [savedRows] = await pool.query(savedSql, [userId]);

        let savedGameIds = new Set();
        let genreCounts = {};

        for (let row of savedRows) {
            savedGameIds.add(String(row.rawg_game_id));

            if (row.genres) {
                let genreList = row.genres.split(",");

                for (let genre of genreList) {
                    let cleanGenre = genre.trim();

                    if (cleanGenre != "") {
                        if (!genreCounts[cleanGenre]) {
                            genreCounts[cleanGenre] = 0;
                        }
                        genreCounts[cleanGenre]++;
                    }
                }
            }
        }

        let topGenre = "";
        let recommendedGames = [];

        if (Object.keys(genreCounts).length > 0) {
            let sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
            topGenre = sortedGenres[0][0];

            let genreSlug = topGenre.toLowerCase()
                .replace(/&/g, "and")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            let genresUrl = `https://api.rawg.io/api/genres?key=${RAWG_API_KEY}&page_size=40`;
            let genresResponse = await fetch(genresUrl);
            let genresData = await genresResponse.json();

            let matchedGenre = null;

            if (genresData.results) {
                matchedGenre = genresData.results.find(genre =>
                    genre.name.toLowerCase() == topGenre.toLowerCase()
                );
            }

            if (matchedGenre) {
                genreSlug = matchedGenre.slug;
            }

            let recommendedUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&genres=${genreSlug}&ordering=-rating&page_size=20`;
            let recommendedResponse = await fetch(recommendedUrl);
            let recommendedData = await recommendedResponse.json();

            if (recommendedData.results) {
                recommendedGames = recommendedData.results.filter(game =>
                    !savedGameIds.has(String(game.id))
                ).slice(0, 12);
            }
        }

        res.render('browse.ejs', {
            popularGames,
            topRatedGames,
            recentGames,
            recommendedGames,
            topGenre,
            authenticated: req.session.authenticated,
            username: req.session.username
        });

    } catch (err) {
        console.error("Browse page error:", err);
        res.status(500).send("Browse page error!");
    }
});

// Save or update game
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

        const [rows] = await pool.query(sql, [userId, rawgGameId]);

        if (rows.length > 0) {
            sql = `UPDATE saved_games
                   SET title = ?,
                       cover_image = ?,
                       genres = ?,
                       status = ?,
                       is_favorite = ?
                   WHERE user_id = ?
                   AND rawg_game_id = ?`;

            let sqlParams = [title, coverImage, genres, status, isFavorite, userId, rawgGameId];

            await pool.query(sql, sqlParams);

            return res.json({
                success: "Game updated successfully in your library!"
            });
        }

        sql = `INSERT INTO saved_games
               (user_id, rawg_game_id, title, cover_image, genres, status, is_favorite)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

        let sqlParams = [userId, rawgGameId, title, coverImage, genres, status, isFavorite];

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
            libraryMessage,
            authenticated: req.session.authenticated,
            username: req.session.username
        });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

// Update saved game
app.post('/updateSavedGame', isUserAuthenticated, async (req, res) => {
    let savedGameId = req.body.savedGameId;
    let status = req.body.status;
    let genres = req.body.genres;
    let isFavorite = req.body.is_favorite ? 1 : 0;
    let userId = req.session.userId;

    try {
        if (!status || status.trim() == "") {
            return res.redirect('/library?libraryMessage=Please select a status.');
        }

        let sql = `UPDATE saved_games
                   SET status = ?, genres = ?, is_favorite = ?
                   WHERE id = ?
                   AND user_id = ?`;

        let sqlParams = [status, genres, isFavorite, savedGameId, userId];

        await pool.query(sql, sqlParams);

        res.redirect('/library?libraryMessage=Saved game updated successfully.');

    } catch (err) {
        console.error("Database error:", err);
        res.redirect('/library?libraryMessage=Database error while updating game.');
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

        res.redirect('/library?libraryMessage=Game removed from library.');

    } catch (err) {
        console.error("Database error:", err);
        res.redirect('/library?libraryMessage=Database error while removing game.');
    }
});

// Trending page
app.get('/trending', isUserAuthenticated, async (req, res) => {
    try {
        let url = `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=10&maxAge=72`;
        let response = await fetch(url);
        let dealData = await response.json();

        res.render('trending.ejs', {
            deals: dealData,
            authenticated: req.session.authenticated,
            username: req.session.username
        });
    } catch (err) {
        console.error("Error fetching trending games:", err);
        res.status(500).send("Error fetching trending games!");
    }
});

// Add review
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

        let checkSql = `SELECT id
                        FROM reviews
                        WHERE user_id = ?
                        AND rawg_game_id = ?`;

        let [existingRows] = await pool.query(checkSql, [userId, rawgGameId]);

        if (existingRows.length > 0) {
            return res.json({
                error: "You already reviewed this game. Use the update option."
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

// Profile shortcut
app.get('/profile', isUserAuthenticated, (req, res) => {
    res.redirect(`/user/${req.session.userId}`);
});

// View user profile
app.get('/user/:userId', isUserAuthenticated, async (req, res) => {
    let profileUserId = req.params.userId;

    try {
        let userSql = `SELECT id, username, display_name, profile_image, bio, featured_games, created_at
                       FROM users
                       WHERE id = ?`;

        let [userRows] = await pool.query(userSql, [profileUserId]);

        if (userRows.length == 0) {
            return res.status(404).send("User not found.");
        }

        let profileUser = userRows[0];
        let isOwnProfile = Number(profileUser.id) === Number(req.session.userId);

        let statsSql = `SELECT
                            COUNT(*) totalSaved,
                            SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) totalFavorites
                        FROM saved_games
                        WHERE user_id = ?`;

        let reviewStatsSql = `SELECT COUNT(*) totalReviews
                              FROM reviews
                              WHERE user_id = ?`;

        let [statsRows] = await pool.query(statsSql, [profileUserId]);
        let [reviewStatsRows] = await pool.query(reviewStatsSql, [profileUserId]);

        let featuredGames = [];
        let selectedGameIds = [];

        if (profileUser.featured_games && profileUser.featured_games.trim() != "") {
            selectedGameIds = profileUser.featured_games
                .split(",")
                .map(id => id.trim())
                .filter(id => id != "");
        }

        if (selectedGameIds.length > 0) {
            let placeholders = selectedGameIds.map(() => "?").join(", ");
            let featuredSql = `SELECT rawg_game_id, title, cover_image, status, is_favorite
                               FROM saved_games
                               WHERE user_id = ?
                               AND rawg_game_id IN (${placeholders})`;

            let [featuredRows] = await pool.query(featuredSql, [profileUserId, ...selectedGameIds]);
            featuredGames = featuredRows;
        }

        res.render('profile.ejs', {
            profileUser,
            isOwnProfile,
            featuredGames,
            stats: statsRows[0],
            reviewStats: reviewStatsRows[0],
            authenticated: req.session.authenticated,
            username: req.session.username
        });

    } catch (err) {
        console.error("Profile route error:", err);
        res.status(500).send("Profile route error!");
    }
});

// Edit profile page
app.get('/editProfile', isUserAuthenticated, async (req, res) => {
    let userId = req.session.userId;
    let profileSuccess = req.query.profileSuccess || "";
    let profileError = req.query.profileError || "";

    try {
        let userSql = `SELECT id, username, display_name, profile_image, bio, featured_games
                       FROM users
                       WHERE id = ?`;

        let gamesSql = `SELECT rawg_game_id, title
                        FROM saved_games
                        WHERE user_id = ?
                        ORDER BY title`;

        let [userRows] = await pool.query(userSql, [userId]);
        let [savedGames] = await pool.query(gamesSql, [userId]);

        let userInfo = userRows[0];
        let selectedFeaturedGames = [];

        if (userInfo.featured_games && userInfo.featured_games.trim() != "") {
            selectedFeaturedGames = userInfo.featured_games
                .split(",")
                .map(id => id.trim());
        }

        res.render('editProfile.ejs', {
            userInfo,
            savedGames,
            selectedFeaturedGames,
            profileSuccess,
            profileError,
            authenticated: req.session.authenticated,
            username: req.session.username
        });

    } catch (err) {
        console.error("Edit profile route error:", err);
        res.status(500).send("Edit profile route error!");
    }
});

// Update profile
app.post('/editProfile', isUserAuthenticated, async (req, res) => {
    let userId = req.session.userId;
    let displayName = req.body.display_name;
    let profileImage = req.body.profile_image;
    let bio = req.body.bio;
    let featuredGames = req.body.featured_games || [];

    try {
        if (!displayName || displayName.trim() == "") {
            return res.redirect('/editProfile?profileError=Display name cannot be blank.');
        }

        displayName = displayName.trim();

        if (!profileImage || profileImage.trim() == "") {
            profileImage = "/img/defaultphoto.jpeg";
        } else {
            profileImage = profileImage.trim();
        }

        if (!bio) {
            bio = "";
        }

        if (!Array.isArray(featuredGames)) {
            featuredGames = [featuredGames];
        }

        let featuredGamesString = featuredGames.join(",");

        let sql = `UPDATE users
                   SET display_name = ?, profile_image = ?, bio = ?, featured_games = ?
                   WHERE id = ?`;

        let sqlParams = [displayName, profileImage, bio, featuredGamesString, userId];

        await pool.query(sql, sqlParams);

        res.redirect('/editProfile?profileSuccess=Profile updated successfully.');

    } catch (err) {
        console.error("Profile update error:", err);
        res.redirect('/editProfile?profileError=Database error while updating profile.');
    }
});

// Edit review page
app.get('/editReview', isUserAuthenticated, async (req, res) => {
    let reviewId = req.query.reviewId;
    let userId = req.session.userId;

    try {
        let sql = `SELECT id, user_id, rawg_game_id, rating, review_title, review_text
                   FROM reviews
                   WHERE id = ?
                   AND user_id = ?`;

        let [rows] = await pool.query(sql, [reviewId, userId]);

        if (rows.length == 0) {
            return res.redirect('/home');
        }

        let reviewInfo = rows[0];

        res.render('editReview.ejs', {
            reviewInfo,
            authenticated: req.session.authenticated,
            username: req.session.username
        });

    } catch (err) {
        console.error("Edit review route error:", err);
        res.status(500).send("Edit review route error!");
    }
});

// Update review
app.post('/updateReview', isUserAuthenticated, async (req, res) => {
    let reviewId = req.body.reviewId;
    let rawgGameId = req.body.rawg_game_id;
    let userId = req.session.userId;
    let rating = parseInt(req.body.rating);
    let reviewTitle = req.body.review_title;
    let reviewText = req.body.review_text;

    try {
        if (!rating || rating < 1 || rating > 5) {
            return res.redirect(`/editReview?reviewId=${reviewId}`);
        }

        if (!reviewTitle || reviewTitle.trim() == "") {
            return res.redirect(`/editReview?reviewId=${reviewId}`);
        }

        if (!reviewText || reviewText.trim() == "") {
            return res.redirect(`/editReview?reviewId=${reviewId}`);
        }

        let sql = `UPDATE reviews
                   SET rating = ?, review_title = ?, review_text = ?
                   WHERE id = ?
                   AND user_id = ?`;

        let sqlParams = [rating, reviewTitle, reviewText, reviewId, userId];

        await pool.query(sql, sqlParams);

        res.redirect(`/gameInfo?gameId=${rawgGameId}`);

    } catch (err) {
        console.error("Update review error:", err);
        res.status(500).send("Update review error!");
    }
});

// Delete review
app.post('/deleteReview', isUserAuthenticated, async (req, res) => {
    let reviewId = req.body.reviewId;
    let rawgGameId = req.body.rawg_game_id;
    let userId = req.session.userId;

    try {
        let sql = `DELETE FROM reviews
                   WHERE id = ?
                   AND user_id = ?`;

        await pool.query(sql, [reviewId, userId]);

        res.redirect(`/gameInfo?gameId=${rawgGameId}`);

    } catch (err) {
        console.error("Delete review error:", err);
        res.status(500).send("Delete review error!");
    }
});

app.listen(3000, () => {
    console.log("Express server running");
});