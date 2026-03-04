-- ============================================================
-- Migration: 20260304_120000_create_marina_hosts_junction_and_assign_host1.sql
-- Description: Replace the single marina_id column on hosts with a proper
--              many-to-many marina_hosts junction table so that one host
--              account can manage multiple marinas.
--              Assigns host id=1 (Alex Gomez) as primary manager of ALL
--              currently listed marinas (IDs 10-14, 19-38).
-- ============================================================

-- Step 1: Create the junction table
CREATE TABLE IF NOT EXISTS `marina_hosts` (
  `host_id`    INT(10) UNSIGNED NOT NULL,
  `marina_id`  INT(10) UNSIGNED NOT NULL,
  `role`       ENUM('primary','manager','staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manager',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`host_id`, `marina_id`),
  INDEX `idx_mh_marina_id` (`marina_id`),
  CONSTRAINT `fk_mh_host`   FOREIGN KEY (`host_id`)   REFERENCES `hosts`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mh_marina` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Junction table: which hosts manage which marinas (many-to-many)';

-- Step 2: Migrate the existing single-marina relationship for host 1
--         (currently marina_id = 10 on the hosts row) plus all other marinas
--         that already carry host_id = 1 in the marinas table.
INSERT IGNORE INTO `marina_hosts` (`host_id`, `marina_id`, `role`)
SELECT 1, id, 'primary'
FROM `marinas`
WHERE id IN (10, 11, 12, 13, 14, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38);

-- Step 3: For any other host that still has a marina_id set on the hosts row,
--         migrate that relationship into the junction table as well (future-proof).
INSERT IGNORE INTO `marina_hosts` (`host_id`, `marina_id`, `role`)
SELECT h.id, h.marina_id, h.role
FROM `hosts` h
WHERE h.marina_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `marina_hosts` mh
    WHERE mh.host_id = h.id AND mh.marina_id = h.marina_id
  );

-- Step 4: (Optional / non-destructive) The hosts.marina_id and hosts.role columns
--         are kept for backward compatibility but are no longer authoritative.
--         The application now reads host-marina relationships from marina_hosts.
-- To clean up later you may run:
--   ALTER TABLE `hosts` DROP FOREIGN KEY `hosts_ibfk_marina`;
--   ALTER TABLE `hosts` DROP COLUMN `marina_id`, DROP COLUMN `role`;
