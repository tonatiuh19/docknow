-- Migration: Add Harbor as a new marina business type
-- Date: 2026-03-02 15:00:00
-- Description: Adds "Harbor" as business type id=5 to marina_business_types.
--              Harbors are protected bodies of water that can contain coves,
--              moorings, and anchorages (e.g. Catalina Harbor, Two Harbors).
--              Coves are treated as sub-locations within a Harbor listing.

INSERT INTO `marina_business_types` (`id`, `name`, `slug`, `description`, `is_active`) VALUES
(5, 'Harbor', 'harbor', 'Protected body of water with moorings and anchorages. Includes coves as sub-locations (e.g. Catalina Island harbors and coves with rentable moorings).', 1);
