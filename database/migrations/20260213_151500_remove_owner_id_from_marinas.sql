-- =====================================================
-- Migration: Remove owner_id from marinas table
-- Created: 2026-02-13 15:15:00
-- Description: Removes owner_id column and foreign key constraint since we only use hosts
-- =====================================================

-- Drop the foreign key constraint first
ALTER TABLE `marinas` DROP FOREIGN KEY `marinas_ibfk_1`;

-- Drop the index on owner_id
ALTER TABLE `marinas` DROP INDEX `idx_owner`;

-- Drop the owner_id column
ALTER TABLE `marinas` DROP COLUMN `owner_id`;

-- =====================================================
-- This migration:
-- 1. Removes the foreign key constraint to users(id)
-- 2. Drops the index on owner_id for better performance
-- 3. Removes the owner_id column entirely
-- 
-- After this migration, marinas will only have host_id which 
-- references the hosts table. This simplifies the data model
-- by removing the redundant owner concept.
-- =====================================================