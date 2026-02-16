-- =====================================================
-- Migration: Insert Remaining Seabeds (Partial Migration Fix)
-- Created: 2026-02-13 15:30:00
-- Description: Insert seabeds data only - for when anchorages are already created
-- =====================================================

-- Insert Seabeds for Anchorages (ensure anchorages with IDs 1-10 exist first)
INSERT INTO `seabeds` (`marina_id`, `anchorage_id`, `seabed_type_id`, `description`, `depth_meters`, `notes`, `created_at`) VALUES

-- Golden Gate Area Seabeds (references anchorage IDs 1, 2)
(10, 1, 2, 'Muddy bottom in protected anchorage provides excellent holding', 15.00, 'Excellent anchor holding, recommended for overnight stays', NOW()),
(10, 2, 1, 'Sandy bottom with patches of mud, good holding quality', 12.00, 'Good holding in most weather conditions', NOW()),

-- Tampa Bay Seabeds (references anchorage IDs 3, 4)
(11, 3, 1, 'Sandy bottom typical of Gulf Coast waters', 9.00, 'Good holding for most anchor types', NOW()),
(11, 4, 8, 'Mixed sand and shell bottom composition', 7.00, 'Moderate holding, check anchor frequently', NOW()),

-- Miami Beach Seabeds (references anchorage IDs 5, 6)
(12, 5, 1, 'Clean sandy bottom in harbor waters', 18.00, 'Good holding, easy anchor retrieval', NOW()),
(12, 6, 3, 'Clay bottom provides excellent anchor holding', 22.00, 'Excellent holding but may require windlass for retrieval', NOW()),

-- Galveston Bay Seabeds (references anchorage IDs 7, 8)
(13, 7, 2, 'Muddy bottom with excellent holding characteristics', 6.00, 'Excellent holding, popular with fishing boats', NOW()),
(13, 8, 8, 'Mixed mud and sand bottom in protected bayou', 4.00, 'Good holding in calm conditions', NOW()),

-- Puget Sound Seabeds (references anchorage IDs 9, 10)
(14, 9, 2, 'Deep mud bottom with excellent holding quality', 25.00, 'Excellent holding even in strong tidal currents', NOW()),
(14, 10, 6, 'Gravel and sand mix typical of Pacific Northwest', 35.00, 'Moderate holding, suitable for short stays', NOW());