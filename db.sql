SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Tablo için tablo yapısı `blocks`
--

CREATE TABLE `blocks` (
  `id` int NOT NULL,
  `network_id` int NOT NULL,
  `block_id` int NOT NULL,
  `hash` text NOT NULL,
  `data` json DEFAULT NULL,
  `created` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `data`
--

CREATE TABLE `data` (
  `id` int NOT NULL,
  `network_id` int DEFAULT NULL,
  `k` tinytext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `data` json NOT NULL,
  `last_updated` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `peers`
--

CREATE TABLE `peers` (
  `id` int NOT NULL,
  `network_id` int NOT NULL,
  `data` json NOT NULL,
  `last_updated` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `txs`
--

CREATE TABLE `txs` (
  `id` int NOT NULL,
  `network_id` int NOT NULL,
  `txno` int NOT NULL,
  `txid` text NOT NULL,
  `block_hash` text NOT NULL,
  `height` int DEFAULT NULL,
  `data` json NOT NULL,
  `created` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `blocks`
--
ALTER TABLE `blocks`
  ADD PRIMARY KEY (`id`);

--
-- Tablo için indeksler `data`
--
ALTER TABLE `data`
  ADD PRIMARY KEY (`id`);

--
-- Tablo için indeksler `peers`
--
ALTER TABLE `peers`
  ADD PRIMARY KEY (`id`);

--
-- Tablo için indeksler `txs`
--
ALTER TABLE `txs`
  ADD PRIMARY KEY (`id`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `blocks`
--
ALTER TABLE `blocks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `data`
--
ALTER TABLE `data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `peers`
--
ALTER TABLE `peers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `txs`
--
ALTER TABLE `txs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
