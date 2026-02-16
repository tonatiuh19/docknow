-- =====================================================
-- Migration: Insert Missing Seabeds Data Only
-- Created: 2026-02-13 15:00:00
-- Description: Adds only missing seabeds data for existing anchorages (IDs 9-18)
-- Note: All other data (marinas, slips, images, features, amenities, anchorages, moorings, points) already exists in database
-- =====================================================


-- Insert Seabeds for Existing Anchorages (References existing anchorage IDs 9-18)
INSERT INTO `seabeds` (`marina_id`, `anchorage_id`, `seabed_type_id`, `description`, `depth_meters`, `notes`, `created_at`) VALUES

-- Golden Gate Area Seabeds (for anchorages 9 and 10)
(10, 9, 2, 'Muddy bottom in protected anchorage provides excellent holding', 15.00, 'Excellent anchor holding, recommended for overnight stays', NOW()),
(10, 10, 1, 'Sandy bottom with patches of mud, good holding quality', 12.00, 'Good holding in most weather conditions', NOW()),

-- Tampa Bay Seabeds (for anchorages 11 and 12)
(11, 11, 1, 'Sandy bottom typical of Gulf Coast waters', 9.00, 'Good holding for most anchor types', NOW()),
(11, 12, 8, 'Mixed sand and shell bottom composition', 7.00, 'Moderate holding, check anchor frequently', NOW()),

-- Miami Beach Seabeds (for anchorages 13 and 14)
(12, 13, 1, 'Clean sandy bottom in harbor waters', 18.00, 'Good holding, easy anchor retrieval', NOW()),
(12, 14, 3, 'Clay bottom provides excellent anchor holding', 22.00, 'Excellent holding but may require windlass for retrieval', NOW()),

-- Galveston Bay Seabeds (for anchorages 15 and 16)
(13, 15, 2, 'Muddy bottom with excellent holding characteristics', 6.00, 'Excellent holding, popular with fishing boats', NOW()),
(13, 16, 8, 'Mixed mud and sand bottom in protected bayou', 4.00, 'Good holding in calm conditions', NOW()),

-- Puget Sound Seabeds (for anchorages 17 and 18)
(14, 17, 2, 'Deep mud bottom with excellent holding quality', 25.00, 'Excellent holding even in strong tidal currents', NOW()),
(14, 18, 6, 'Gravel and sand mix typical of Pacific Northwest', 35.00, 'Moderate holding, suitable for short stays', NOW());

-- =====================================================
-- Summary of inserted data:
-- - 10 seabed records for existing anchorages (IDs 9-18)
-- - References existing marinas (IDs 10-14) 
-- - Various seabed types for realistic testing scenarios
-- - Depth and holding characteristics for each anchorage
-- 
-- This completes the missing seabed data while avoiding
-- duplicate insertions of existing marina data.
-- =====================================================