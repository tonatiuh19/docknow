-- Migration: Enable multiple hosts per marina
-- Created: 2026-02-16 15:30:00  
-- Description: Add marina_id to hosts table and migrate existing relationships

-- Step 1: Add marina_id column to hosts table
ALTER TABLE `hosts` 
ADD COLUMN `marina_id` INT(10) UNSIGNED DEFAULT NULL AFTER `id`,
ADD COLUMN `role` ENUM('primary', 'manager', 'staff') NOT NULL DEFAULT 'manager' AFTER `marina_id`,
ADD INDEX `idx_marina_id` (`marina_id`),
ADD INDEX `idx_role` (`role`);

-- Step 2: Migrate existing marina.host_id relationships to hosts.marina_id
UPDATE `hosts` h
JOIN `marinas` m ON m.host_id = h.id
SET h.marina_id = m.id, h.role = 'primary';

-- Step 3: Add foreign key constraint
ALTER TABLE `hosts`
ADD CONSTRAINT `hosts_ibfk_marina` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE;

-- Note: We keep marinas.host_id for backward compatibility but hosts.marina_id is now the authoritative relationship