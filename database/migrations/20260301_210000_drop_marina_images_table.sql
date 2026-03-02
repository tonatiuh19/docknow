-- ============================================================
-- Migration: Drop marina_images table
-- Date: 2026-03-01
-- Description: Images are now stored inline on the marinas table:
--   cover_image_url  TEXT  — primary cover photo URL
--   gallery_image_urls TEXT — JSON array of additional image URLs
--
-- PRE-REQUISITE: Run 20260301_120000_add_images_to_marinas.sql first
--   and ensure all image data has been migrated to those columns.
-- ============================================================

DROP TABLE IF EXISTS `marina_images`;
