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
(1, 1, 'blockchaininfo', '', '2024-11-30 19:30:31'),
(2, 2, 'blockchaininfo', '', '2024-09-21 11:29:26');

INSERT INTO `peers` (`id`, `network_id`, `data`, `last_updated`) VALUES
(1, 1, '', '2024-11-30 19:30:31'),
(2, 2, '', '2024-09-21 11:29:24');
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

--
-- Tablo için tablo yapısı `faucet_txs`
--

CREATE TABLE `faucet_txs` (
  `id` int NOT NULL,
  `network_id` int NOT NULL,
  `data` json NOT NULL,
  `last_updated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Tablo döküm verisi `faucet_txs`
--

INSERT INTO `faucet_txs` (`id`, `network_id`, `data`, `last_updated`) VALUES
(1, 1, '{}', '2024-11-03 01:35:25');
INSERT INTO `faucet_txs` (`id`, `network_id`, `data`, `last_updated`) VALUES
(2, 2, '{}', '2024-09-21 10:55:40');

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `faucet_txs`
--
ALTER TABLE `faucet_txs`
  ADD PRIMARY KEY (`id`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `faucet_txs`
--
ALTER TABLE `faucet_txs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

-- 
-- Add indexes for some of the fields
--
CREATE INDEX idx_network_id ON blocks(network_id);
CREATE INDEX idx_block_id ON blocks(block_id);
CREATE INDEX idx_hash ON blocks(hash);

CREATE INDEX idx_network_id ON txs(network_id);
CREATE INDEX idx_block_hash ON txs(block_hash);
CREATE INDEX idx_height ON txs(height);
CREATE INDEX idx_txno ON txs(txno);
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
