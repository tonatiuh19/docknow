-- ============================================================
-- Migration: 20260301_190000_add_is_directory_only_to_marinas.sql
-- Description: Add is_directory_only flag to marinas table.
--
-- PURPOSE:
--   Marks marinas that are publicly-sourced directory entries only.
--   These records:
--     - Are NOT owned by / registered with DockNow
--     - Cannot be booked through the platform
--     - Are shown for informational/discovery purposes only
--     - Will display a UI banner to inform end-users
--
-- DEFAULT: 0 (normal, bookable marina)
-- VALUE 1 : directory-only, non-bookable marina
-- ============================================================

ALTER TABLE `marinas`
  ADD COLUMN `is_directory_only` TINYINT(1) NOT NULL DEFAULT 0
  COMMENT 'When 1, this marina is a public directory entry only — not registered with DockNow and cannot be booked.'
  AFTER `is_featured`;

-- Index for fast filtering in search queries
ALTER TABLE `marinas`
  ADD KEY `idx_directory_only` (`is_directory_only`);
