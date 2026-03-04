-- ============================================================
-- Migration: 20260304_130000_insert_host_sean_stanley_assign_all_marinas.sql
-- Description: Insert new host Sean Stanley and assign as primary
--              manager of all currently listed marinas (IDs 10-14, 19-38).
-- ============================================================

-- Step 1: Insert the new host
INSERT INTO `hosts` (`marina_id`, `role`, `email`, `full_name`, `phone`, `phone_code`, `country_code`, `is_active`, `email_verified`, `created_at`, `updated_at`)
VALUES (NULL, 'primary', 'seanmoustakas@gmail.com', 'Sean Stanley', '7143575714', '+1', 'US', 1, 1, NOW(), NOW());

-- Step 2: Assign the new host as primary to all listed marinas
INSERT IGNORE INTO `marina_hosts` (`host_id`, `marina_id`, `role`)
SELECT LAST_INSERT_ID(), id, 'primary'
FROM `marinas`
WHERE id IN (10, 11, 12, 13, 14, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38);
