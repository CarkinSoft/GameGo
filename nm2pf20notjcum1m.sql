-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: k2pdcy98kpcsweia.cbetxkdyhwsb.us-east-1.rds.amazonaws.com
-- Generation Time: May 04, 2026 at 05:22 PM
-- Server version: 8.4.8
-- PHP Version: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nm2pf20notjcum1m`
--

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `rawg_game_id` int NOT NULL,
  `rating` int NOT NULL,
  `review_title` varchar(100) DEFAULT NULL,
  `review_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `rawg_game_id`, `rating`, `review_title`, `review_text`, `created_at`) VALUES
(4, 16, 339958, 5, 'test', 'testing this out', '2026-04-25 04:03:36'),
(5, 15, 5679, 5, 'Childhood in a game!', 'Great game would play again, 10 out of 10 IGN', '2026-04-27 18:33:45'),
(7, 17, 422, 5, 'Great game to get lost in!', 'Great game, easy to pick but lots to do. Just like minecraft it has that 2 week phase where you play nonstop by yourself or with friends. 10 out of 10 IGN', '2026-04-27 18:41:04'),
(8, 20, 22895, 1, 'Terrible', 'Best Game I ever played', '2026-04-28 23:57:30'),
(10, 20, 415171, 5, 'best game hands down', '10/10', '2026-05-04 17:24:06'),
(11, 20, 58781, 1, 'Best Game EBER', 'Fuck this game, it sucks', '2026-05-04 17:28:32'),
(12, 15, 22511, 5, 'Great Game and Great Music!', 'Never played a legend of zelda game but once I picked this one up on my switch I was hooked. The gameplay is great and open world works well, although a lot of empty space. The music in the game is on point with cutscenes and battling. If you like open world rpgs then youll like this one.', '2026-05-04 21:09:12');

-- --------------------------------------------------------

--
-- Table structure for table `saved_games`
--

CREATE TABLE `saved_games` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `rawg_game_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `genres` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Want to Play',
  `is_favorite` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `saved_games`
--

INSERT INTO `saved_games` (`id`, `user_id`, `rawg_game_id`, `title`, `cover_image`, `genres`, `status`, `is_favorite`, `created_at`) VALUES
(17, 16, 339958, 'Persona 5 Royal', 'https://media.rawg.io/media/games/a9c/a9c789951de65da545d51f664b4f2ce0.jpg', 'Adventure, RPG', 'Completed', 1, '2026-04-25 04:03:18'),
(20, 20, 22895, 'Leisure Suit Larry', 'https://media.rawg.io/media/screenshots/8d5/8d573a4c6be9b077ef096e46d51bf330.jpg', 'Action, Adventure, Platformer', 'Want to Play', 0, '2026-04-28 23:57:17'),
(21, 20, 5679, 'The Elder Scrolls V: Skyrim', 'https://media.rawg.io/media/games/7cf/7cfc9220b401b7a300e409e539c9afd5.jpg', 'Action, RPG', 'Want to Play', 1, '2026-04-29 00:58:20'),
(22, 19, 914789, 'Hi-Fi Rush', 'https://media.rawg.io/media/games/62f/62f71917e64e913f2a893e7373319c60.jpg', 'Action, Adventure', 'Completed', 0, '2026-05-02 00:09:46'),
(23, 20, 1013132, 'Halo Campaign Evolved', 'https://media.rawg.io/media/screenshots/cea/cea7e2e717aa3c66d4f3197d5b901866.jpg', 'Action, Shooter, Adventure', 'Want to Play', 1, '2026-05-02 00:09:57'),
(24, 22, 3498, 'Grand Theft Auto V', 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg', 'Action', 'Playing', 1, '2026-05-02 00:39:44'),
(25, 23, 28121, 'Slay the Spire', 'https://media.rawg.io/media/games/f52/f5206d55f918edf8ee07803101106fa6.jpg', 'RPG, Strategy, Card, Indie', 'Completed', 0, '2026-05-02 15:27:49'),
(26, 23, 1010539, 'Megabonk', 'https://media.rawg.io/media/games/ffc/ffc03c98caaff1651237ffdabe57ec37.jpg', 'Action, Casual, Indie', 'Playing', 0, '2026-05-02 15:29:05'),
(27, 23, 339958, 'Persona 5 Royal', 'https://media.rawg.io/media/games/a9c/a9c789951de65da545d51f664b4f2ce0.jpg', 'Adventure, RPG', 'Completed', 1, '2026-05-02 15:59:46'),
(29, 18, 42187, 'The Sims 4', 'https://media.rawg.io/media/games/e44/e445335e611b4ccf03af71fffcbd30a4.jpg', 'Strategy, Simulation, Casual', 'Completed', 1, '2026-05-04 02:06:13'),
(30, 20, 415171, 'Valorant', 'https://media.rawg.io/media/games/b11/b11127b9ee3c3701bd15b9af3286d20e.jpg', 'Action, Shooter, Strategy', 'Playing', 1, '2026-05-04 17:23:40'),
(31, 15, 5679, 'The Elder Scrolls V: Skyrim', 'https://media.rawg.io/media/games/7cf/7cfc9220b401b7a300e409e539c9afd5.jpg', 'Action, RPG', 'Completed', 1, '2026-05-04 20:48:57'),
(32, 15, 422, 'Terraria', 'https://media.rawg.io/media/games/f46/f466571d536f2e3ea9e815ad17177501.jpg', 'Action, Indie, Platformer', 'Want to Play', 1, '2026-05-04 20:53:50'),
(33, 15, 14446, 'Call of Duty: Black Ops II', 'https://media.rawg.io/media/games/8ee/8eed88e297441ef9202b5d1d35d7d86f.jpg', 'Action, Shooter', 'Completed', 0, '2026-05-04 20:54:42'),
(34, 15, 25057, 'Wii Sports', 'https://media.rawg.io/media/games/173/1739bdc5c33e85a0fa54b499a173690b.jpg', 'Sports', 'Playing', 0, '2026-05-04 21:23:30'),
(35, 23, 963212, 'Metaphor: ReFantazio', 'https://media.rawg.io/media/games/2cd/2cd2467a32aaaed0bdeb192c2831cfe0.jpg', 'Action, Adventure, RPG', 'Completed', 1, '2026-05-04 21:26:06'),
(36, 15, 3272, 'Rocket League', 'https://media.rawg.io/media/games/8cc/8cce7c0e99dcc43d66c8efd42f9d03e3.jpg', 'Sports, Racing, Indie', 'Playing', 0, '2026-05-04 21:26:47'),
(37, 15, 290856, 'Apex Legends', 'https://media.rawg.io/media/games/737/737ea5662211d2e0bbd6f5989189e4f1.jpg', 'Action, Shooter', 'Dropped', 0, '2026-05-04 21:27:05'),
(38, 15, 1007483, 'Battlefield 6', 'https://media.rawg.io/media/games/dcc/dcc38d78ab1f1a90fdc4ba1bea3a73ff.jpg', 'Action, Shooter', 'Dropped', 0, '2026-05-04 21:27:40'),
(39, 15, 274755, 'Hades', 'https://media.rawg.io/media/games/1f4/1f47a270b8f241e4676b14d39ec620f7.jpg', 'Action, Adventure, RPG, Indie', 'Completed', 1, '2026-05-04 21:28:07'),
(40, 15, 891238, 'Hades II', 'https://media.rawg.io/media/games/8fd/8fd2e8317849fd265ad8781c324d4ec2.jpg', 'Action, Adventure, RPG, Indie', 'Want to Play', 0, '2026-05-04 21:28:21'),
(41, 15, 38, 'Injustice 2', 'https://media.rawg.io/media/games/e42/e428e70c97064037326d7863a43a0454.jpg', 'Fighting', 'Completed', 0, '2026-05-04 21:28:45'),
(42, 15, 53627, 'The Urbz: Sims in the City', 'https://media.rawg.io/media/games/b19/b1951a3cbc8657de8a84451e3a27daaf.jpg', 'Simulation', 'Completed', 0, '2026-05-04 21:29:53'),
(43, 17, 654, 'Stardew Valley', 'https://media.rawg.io/media/games/713/713269608dc8f2f40f5a670a14b2de94.jpg', 'RPG, Simulation, Indie', 'Completed', 1, '2026-05-04 21:33:37'),
(44, 17, 1008671, 'PEAK.', 'https://media.rawg.io/media/screenshots/d11/d11f2cec3a42cb2e74b1af53c79efa50.jpg', 'Adventure', 'Playing', 0, '2026-05-04 21:34:01'),
(45, 17, 28154, 'Cuphead', 'https://media.rawg.io/media/games/226/2262cea0b385db6cf399f4be831603b0.jpg', 'Action, Indie, Platformer', 'Completed', 1, '2026-05-04 21:34:27'),
(46, 17, 9767, 'Hollow Knight', 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg', 'Action, Indie, Platformer', 'Completed', 0, '2026-05-04 21:34:56'),
(47, 17, 292844, 'Hollow Knight: Silksong', 'https://media.rawg.io/media/games/27c/27cd8b7dead05a870f8a514a9a1915ad.jpg', 'Action, Adventure, Indie, Platformer', 'Want to Play', 0, '2026-05-04 21:35:24');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `display_name` varchar(80) NOT NULL DEFAULT '',
  `profile_image` varchar(255) NOT NULL DEFAULT '/img/defaultphoto.jpeg',
  `bio` text,
  `featured_games` text,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `display_name`, `profile_image`, `bio`, `featured_games`, `is_admin`, `created_at`) VALUES
(15, 'testuser1', '$2b$10$Xd1VYyv3O1m34pNK7eeo1uecWoGDpnaHToTUphoSfbJ04KrQ6bdMm', 'Carlos Cupa', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-URFQ3zKPG2jgl3hVa1U3lV_IP1H_Sg-tuw&s', 'Games are cool!', '', 0, '2026-04-25 04:00:31'),
(16, 'user1', '$2b$10$uCSAJVDcLLl8.O/LnzYP.OHTupAzQ8UbjY3h/ZlGvQl0jAnPryyz2', 'TestName', '/img/defaultphoto.jpeg', '', '', 0, '2026-04-25 04:01:44'),
(17, 'testuser2', '$2b$10$7BD8aiJmBGmWSTPVZ.0DpuPm.xKkaCcCqk6mn5yax5NTbpKZhhwl2', 'testuser2', '/img/defaultphoto.jpeg', '', '', 0, '2026-04-27 18:35:42'),
(18, 'C1', '$2b$10$3Xcp5M.HWqQVmLzUJQ5ptOSiMyoiVBp2SCYsIky9pOYKjGVfqc7gG', 'C1', '/img/defaultphoto.jpeg', '', '', 0, '2026-04-28 21:23:18'),
(19, 'admin', '$2b$10$nneGfiK49vAvF4wQh0J6Y.BnSavzpuZAS1UZinp2RkbsNhf/kyuDm', 'admin', '/img/defaultphoto.jpeg', '', '914789', 0, '2026-04-28 23:08:08'),
(20, 'bigmoney69', '$2b$10$4AeG9WrXwfA45.4tQasIfucH6JlWupCMtoaNoxr05CsO.qJOXc4WO', 'bigmoney69', 'https://cdn2.cdnstep.com/oxyifWF0Pl4UeiaMtGAD/cover-1.thumb256.png', 'Small Library, Big Dreams', '1013132,5679,415171', 0, '2026-04-28 23:56:25'),
(21, 'UGod146', '$2b$10$TdBhSwwxj0EmCNdAQUoV9OzzZQY2jhdaRFooIMniHoj2.rTw1aySa', 'UGod146', '/img/defaultphoto.jpeg', '', '', 0, '2026-04-29 01:20:40'),
(22, 'BigBoris', '$2b$10$WTNa0S9/RaD.KXPPIgY23.8eyUF9UmZouT9Lsqj0kWnOFpLeaA//G', 'BigBoris', '/img/defaultphoto.jpeg', '', '', 0, '2026-05-02 00:39:11'),
(23, 'jb', '$2b$10$9cnmi.F/oiAug1./E4F/eONiViajHy/UsU85tdlTEFu4O8UYZgaqK', 'jb', '/img/defaultphoto.jpeg', '', '1010539,339958', 0, '2026-05-02 15:02:15'),
(24, 'Eric', '$2b$10$gYuQW5hIJrLi/Y.RNRXqFe3RHDHFBLRgMsCn/P3DmMpvWdpuJp936', 'Eric', '/img/defaultphoto.jpeg', '', '', 0, '2026-05-04 17:22:34'),
(25, 'jjjj', '$2b$10$gLemDW8TKPdLobmqpgUJ8.TloggAAirml.RqeBhDWZZblVXKqcmMK', 'jjjj', '/img/defaultphoto.jpeg', '', '', 0, '2026-05-04 21:43:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `saved_games`
--
ALTER TABLE `saved_games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_game` (`user_id`,`rawg_game_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `saved_games`
--
ALTER TABLE `saved_games`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_games`
--
ALTER TABLE `saved_games`
  ADD CONSTRAINT `saved_games_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
