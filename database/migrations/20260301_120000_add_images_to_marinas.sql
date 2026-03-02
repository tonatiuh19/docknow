-- Migration: Add image columns to marinas table
-- Date: 2026-03-01

ALTER TABLE `marinas`
  ADD COLUMN `cover_image_url` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL
    AFTER `website_url`,
  ADD COLUMN `gallery_image_urls` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL
    AFTER `cover_image_url`;

-- gallery_image_urls stores a JSON array of URL strings, e.g.:
-- ["https://disruptinglabs.com/data/docknow/marina-temp-123/images/abc.jpg", ...]
