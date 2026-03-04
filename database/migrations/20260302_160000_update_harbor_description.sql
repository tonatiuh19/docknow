-- Migration: Update Harbor business type description
-- Date: 2026-03-02 16:00:00
-- Description: Clarifies that coves are sub-locations within OR NEAR the harbor,
--              since some coves sit on the outskirts of a harbour boundary.

UPDATE `marina_business_types`
SET `description` = 'Protected body of water with moorings and anchorages. Includes coves as sub-locations within or near the harbor (e.g. Catalina Island harbors and coves with rentable moorings).'
WHERE `slug` = 'harbor';
