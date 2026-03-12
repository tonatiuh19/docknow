-- Migration: Add service_type to bookings and photo_url to boats
-- Date: 2026-03-11 12:00:00
--
-- 1. Add service_type column to bookings
--    Possible values:
--      'slip'                 - Standard marina slip booking (default)
--      'dry_stack'           - Dry stack (stacked boat storage) operation
--      'shipyard_maintenance' - Shipyard / haul-out maintenance service
--
-- 2. Add photo_url column to boats
--    Stores the CDN URL of the boat's primary photo

ALTER TABLE `bookings`
  ADD COLUMN `service_type` ENUM('slip', 'dry_stack', 'shipyard_maintenance')
    NOT NULL DEFAULT 'slip'
    COMMENT 'Type of marina service being booked'
    AFTER `special_requests`;

ALTER TABLE `boats`
  ADD COLUMN `photo_url` VARCHAR(1024)
    DEFAULT NULL
    COMMENT 'CDN URL of the boat primary photo'
    AFTER `insurance_policy_number`;
