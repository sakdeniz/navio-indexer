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

--
-- Tablo döküm verisi `data`
--

INSERT INTO `data` (`id`, `network_id`, `k`, `data`, `last_updated`) VALUES
(1, 1, 'blockchaininfo', '[{\"time\": 1732984130, \"chain\": \"test\", \"blocks\": 0, \"pruned\": false, \"headers\": 0, \"warnings\": \"This is a pre-release test build - use at your own risk - do not use for mining or merchant applications\", \"chainwork\": \"000000000000000000000000000000000000000000000003431c15e08ba0981a\", \"difficulty\": \"6389.768043882866\", \"mediantime\": 1732983729, \"size_on_disk\": 1081784479, \"bestblockhash\": \"51b311ffdb15fe60187095eb408430c6c7a92f7f570123bd22708b1da9fa6373\", \"averageblockspacing\": 62, \"initialblockdownload\": false, \"verificationprogress\": 1}]', '2024-11-30 19:30:31'),
(2, 2, 'blockchaininfo', '[{\"time\": 1726907180, \"chain\": \"test\", \"blocks\": 0, \"pruned\": false, \"headers\": 0, \"warnings\": \"This is a pre-release test build - use at your own risk - do not use for mining or merchant applications\", \"chainwork\": \"0000000000000000000000000000000000000000000000015c538a36870e9386\", \"difficulty\": \"179428.5985165534\", \"mediantime\": 1726906912, \"size_on_disk\": 583117853, \"bestblockhash\": \"bbcc1883fcacd34ceab69df7d1b987791c069c99c6b70d1f6f405872d2d9959c\", \"averageblockspacing\": 64, \"initialblockdownload\": false, \"verificationprogress\": 1}]', '2024-09-21 11:29:26');

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `data`
--
ALTER TABLE `data`
  ADD PRIMARY KEY (`id`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `data`
--
ALTER TABLE `data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
