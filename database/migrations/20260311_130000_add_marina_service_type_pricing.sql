-- Migration: Add marina service type pricing table
-- This table stores per-marina pricing for each service type (slip, dry_stack, shipyard_maintenance)
-- Admins/hosts can configure different prices for each service at each marina.

CREATE TABLE `marina_service_type_pricing` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `service_type` ENUM('slip', 'dry_stack', 'shipyard_maintenance') NOT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional notes about this service type at this marina',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_marina_service_type` (`marina_id`, `service_type`),
  CONSTRAINT `fk_mstp_marina_id` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed 'slip' pricing using the minimum slip price per marina.
-- Individual slips have their own price_per_day; this row is a display reference only
-- (actual booking price always comes from the selected slip's own price_per_day).
INSERT INTO `marina_service_type_pricing` (`marina_id`, `service_type`, `price_per_day`, `is_available`)
SELECT m.`id`, 'slip', COALESCE(MIN(s.`price_per_day`), m.`price_per_day`), 1
FROM `marinas` m
LEFT JOIN `slips` s ON s.`marina_id` = m.`id` AND s.`is_available` = 1
WHERE m.`is_active` = 1 AND m.`is_directory_only` = 0
GROUP BY m.`id`, m.`price_per_day`;

-- Seed dry_stack pricing at 1.25× slip price for bookable marinas
INSERT INTO `marina_service_type_pricing` (`marina_id`, `service_type`, `price_per_day`, `is_available`)
SELECT `id`, 'dry_stack', ROUND(`price_per_day` * 1.25, 2), 1
FROM `marinas`
WHERE `is_active` = 1 AND `is_directory_only` = 0;

-- Seed shipyard_maintenance pricing at 1.75× slip price for bookable marinas
INSERT INTO `marina_service_type_pricing` (`marina_id`, `service_type`, `price_per_day`, `is_available`)
SELECT `id`, 'shipyard_maintenance', ROUND(`price_per_day` * 1.75, 2), 1
FROM `marinas`
WHERE `is_active` = 1 AND `is_directory_only` = 0;
