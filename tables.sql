DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS saved_games;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    profile_image VARCHAR(255) NOT NULL DEFAULT '/img/defaultphoto.jpeg',
    bio TEXT NULL,
    featured_games TEXT NULL,
    is_admin TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY username (username)
);

CREATE TABLE saved_games (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    rawg_game_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    cover_image VARCHAR(500) NULL,
    genres VARCHAR(255) NULL,
    status VARCHAR(50) NULL DEFAULT 'Want to Play',
    is_favorite TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_game (user_id, rawg_game_id),
    CONSTRAINT fk_saved_games_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE reviews (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    rawg_game_id INT NOT NULL,
    rating INT NOT NULL,
    review_title VARCHAR(100) NULL,
    review_text TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY user_id (user_id),
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);