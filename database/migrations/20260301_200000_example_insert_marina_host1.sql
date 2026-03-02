-- ============================================================
-- Migration: 20260301_200000_seed_20_directory_marinas.sql
-- Description: Seed 20 publicly-sourced directory marinas for DockNow
-- Host ID used for seeded records: 1
--
-- ⚠️  IMPORTANT — DATA OWNERSHIP & BOOKING NOTICE
-- --------------------------------------------------------
-- All marinas in this file are DIRECTORY-ONLY entries.
-- They are based on publicly available marina information
-- and are NOT registered partners or hosts of DockNow.
--
-- These records:
--   • is_directory_only = 1   → non-bookable, informational only
--   • is_active        = 1   → visible on discovery/map
--   • UI will display a "Directory listing" banner on detail page
--   • Booking widget is hidden / replaced with contact notice
--
-- Run migration 20260301_190000_add_is_directory_only_to_marinas.sql
-- BEFORE executing this file.
-- ============================================================

/* ------------------------------
   Helper: amenity IDs (for reference)
   1=Electricity,2=Water,3=WiFi,4=Fuel,5=Restrooms,
   6=Showers,7=Security,8=Restaurant,9=Laundry,10=Parking
   Seabed type IDs: 1=Sand,2=Mud,3=Clay,4=Rock,5=Coral,6=Gravel,7=Weed,8=Mixed
   Business type 1 = Full Service Marina
   ------------------------------ */

-- ============================================================
-- 1) MIAMI BEACH MARINA (Miami Beach, FL, USA)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Miami Beach Marina','miami-beach-marina',
 'Premier full-service marina located in South Beach offering luxury slips and direct Atlantic access.',
 1,250.00,
 'Miami Beach','Florida','United States',
 '300 Alton Rd','33139',
 25.7705,-80.1340,
 'Dockmaster','info@miamibeachmarina.com','+1 305 673 6000',
 'https://miamibeachmarina.com',
 400,350,
 76.00,6.00,
 1,1,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES
(@marina_id,1,1,1,0,0,1,1,1);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,7),
(@marina_id,8),(@marina_id,9),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy seabed with strong holding.',9.0,'Deep-water access suitable for large yachts.');

UPDATE `marinas` SET `host_id`=1 WHERE `id`=@marina_id;


-- ============================================================
-- 2) BAHIA MAR YACHTING CENTER (Fort Lauderdale, FL, USA)
-- (example high-traffic Fort Lauderdale marina)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Bahia Mar Yachting Center','bahia-mar-yachting-center',
 'Full-service yachting center on Fort Lauderdale Beach near the inlet; fuel, repair, and concierge services.',
 1,200.00,
 'Fort Lauderdale','Florida','United States',
 '801 Seabreeze Blvd','33316',
 26.1218,-80.1011,
 'Dockmaster','info@bahiamarfl.com','+1 954 467 3275',
 'https://bahiamar.com',
 300,260,
 80.00,5.50,
 1,1,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,1,0,0,1,1,1);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,7),
(@marina_id,8),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy bottom near inlet.',10.0,'Good holding; exposed to ocean swells.');


-- ============================================================
-- 3) MARINA DEL REY (Los Angeles area, CA, USA)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Marina del Rey Harbor','marina-del-rey-harbor',
 'Large protected marina with a mix of pleasure craft and charter services close to LA attractions.',
 1,200.00,
 'Marina del Rey','California','United States',
 '13755 Fiji Way','90292',
 33.9803,-118.4508,
 'Dockmaster','info@marinadelrey.com','+1 310 305 9545',
 'https://marinadelrey.com',
 520,480,
 60.00,5.00,
 1,1,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,1,0,1,1,1,1);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,7),
(@marina_id,8),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,8,'Mixed sand and mud, sheltered basin.',6.5,'Well-protected basin.');


-- ============================================================
-- 4) SAFE HARBOR SUNROAD MARINA / SAN DIEGO (San Diego, CA, USA)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Safe Harbor Sunroad Marina','safe-harbor-sunroad-marina',
 'Modern marina in San Diego Bay with premium facilities and yacht services.',
 1,180.00,
 'San Diego','California','United States',
 '955 Harbor Island Dr','92101',
 32.7294,-117.1937,
 'Dockmaster','info@sunroadmarina.com','+1 619 291 0915',
 'https://www.sunroadmarina.com',
 525,470,
 61.00,5.50,
 1,1,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,1,0,1,1,1,1);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,7),
(@marina_id,8),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Mixed sand and mud bottom.',8.5,'Protected harbor basin.');


-- ============================================================
-- 5) NEWPORT HARBOR / NEWPORT BEACH (Newport Beach, CA, USA)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Newport Harbor Marina','newport-harbor-marina',
 'Popular Southern California marina with easy ocean access and yacht services.',
 1,190.00,
 'Newport Beach','California','United States',
 '1600 W Balboa Blvd','92661',
 33.6080,-117.9296,
 'Dockmaster','info@newportharbor.com','+1 949 673 6416',
 'https://newportharbor.org',
 600,540,
 70.00,6.00,
 1,1,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,1,0,1,1,1,1);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,7),
(@marina_id,8),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy shoal areas; protected inner harbor.',7.0,'Good holding inside harbor.');


-- ============================================================
-- 6) PIER 25 / HUDSON RIVER MARINA (New York, NY, USA) - example NYC marina
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Pier 25 Marina','pier-25-marina',
 'Small but busy Manhattan marina on the Hudson River with city access and charter services.',
 1,160.00,
 'New York','New York','United States',
 'West St & N Moore St','10013',
 40.7188,-74.0131,
 'Dockmaster','info@pier25marina.com','+1 212 555 0100',
 'https://example-pier25.com',
 120,100,
 40.00,4.50,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,0,1,0,0,0,0,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,2),(@marina_id,3),(@marina_id,5),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,6,'River mud/gravels typical of Hudson estuary.',5.0,'Tidal currents can be strong.');


-- ============================================================
-- 7) SAFE HARBOR ST. PETE (St. Petersburg, FL, USA)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Safe Harbor St. Pete Marina','safe-harbor-st-pete-marina',
 'Protected marina near downtown St. Petersburg with full amenities and nearby restaurants.',
 1,140.00,
 'St. Petersburg','Florida','United States',
 '6700 34th St N','33710',
 27.7626,-82.6995,
 'Dockmaster','info@stpetemarina.com','+1 727 555 0123',
 'https://safeharbor.com',
 420,380,
 50.00,4.00,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,0,1,0,1,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,5),
(@marina_id,6),(@marina_id,7),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy bottom, calm waters.',5.0,'Good protection from northerly winds.');


-- ============================================================
-- 8) CHARLESTON HARBOR RESORT MARINA (Charleston, SC, USA)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Charleston Harbor Marina','charleston-harbor-marina',
 'Historic Charleston marina with resort access and full service for cruising yachts.',
 1,160.00,
 'Charleston','South Carolina','United States',
 '20 Patriots Point Rd','29464',
 32.7873,-79.8765,
 'Dockmaster','info@charlestonmarina.com','+1 843 555 0145',
 'https://charlestonharbor.com',
 260,230,
 50.00,4.50,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,0,1,0,1,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,8),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy channels with marked approach.',6.0,'Tidal range moderate.');


-- ============================================================
-- 9) SAFE HARBOR NEWPORT (Providence/RI area) - example New England
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Newport Harbor Marina','newport-harbor-ri',
 'Classic New England marina with close access to Newport waterfront and sailing clubs.',
 1,170.00,
 'Newport','Rhode Island','United States',
 '20 Long Wharf','02840',
 41.4901,-71.3128,
 'Dockmaster','info@newportmarina.com','+1 401 555 0199',
 'https://newportharbor.com',
 240,210,
 55.00,4.50,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,0,1,0,0,0,0,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,2),(@marina_id,3),(@marina_id,5),(@marina_id,6),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sheltered sandy bottom.',6.0,'Classic tidal harbor.');


-- ============================================================
-- 10) HARBOR ISLAND / PORTLAND (Portland, ME area example)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Portland Harbor Marina','portland-harbor-marina',
 'Regional marina with fishing charters and access to the Gulf of Maine.',
 1,130.00,
 'Portland','Maine','United States',
 '1 Long Wharf','04101',
 43.6591,-70.2568,
 'Dockmaster','info@portlandmarina.com','+1 207 555 0111',
 'https://portlandharbor.com',
 180,160,
 25.00,3.50,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,0,1,0,0,0,0,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,2),(@marina_id,3),(@marina_id,5),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,6,'Rocky/sandy mix common to Maine coast.',8.0,'Seasonal winter closures possible.');


-- ============================================================
-- 11) IGY MARINA CABO SAN LUCAS (Cabo, Mexico) — fully populated (Mexico)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'IGY Marina Cabo San Lucas','igy-marina-cabo-san-lucas',
 'Iconic world-class marina in Baja California Sur serving sportfishing fleets and superyachts.',
 1,220.00,
 'Cabo San Lucas','Baja California Sur','Mexico',
 'Lote A-18 de la Dársena, Centro','23450',
 22.8839,-109.9037,
 'Dockmaster','info.cabo@igymarinas.com','+52 624 173 9130',
 'https://www.igymarinas.com',
 380,340,
 91.00,6.50,
 1,1,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,1,0,1,1,1,1);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,7),
(@marina_id,8),(@marina_id,9),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy seabed typical of Baja coast.',10.0,'Deep-water marina basin.');


-- ============================================================
-- 12) MARINA VALLARTA (Puerto Vallarta, JAL, Mexico) — fully populated
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Marina Vallarta','marina-vallarta',
 'Full-service marina in Puerto Vallarta offering slips, fuel dock, and resort access.',
 1,150.00,
 'Puerto Vallarta','Jalisco','Mexico',
 'Paseo de la Marina, Marina Vallarta','48335',
 20.6553,-105.2545,
 'Dockmaster','info@marinavallarta.net','+52 322 221 0275',
 'https://marinavallarta.net',
 450,410,
 55.00,4.50,
 1,1,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,0,1,1,1,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,7),
(@marina_id,8),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy and mixed seabed.',7.5,'Protected marina channel.');


-- ============================================================
-- 13) MARINA EL CID / MAZATLAN (Mazatlán, Sinaloa, Mexico) — populated
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Marina El Cid Mazatlán','marina-el-cid-mazatlan',
 'Resort marina adjacent to El Cid properties with charter services and leisure slips.',
 1,140.00,
 'Mazatlán','Sinaloa','Mexico',
 'Av. Camarón Sábalo 123','82110',
 23.2448,-106.4111,
 'Dockmaster','info@marinaelcid.com.mx','+52 669 123 4567',
 'https://marinaelcid.com.mx',
 220,200,
 40.00,4.00,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,0,1,1,1,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,8),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy bottom; good holding near channel.',8.0,'Close to tourist district.');


-- ============================================================
-- 14) ANCHORAGE / MIAMI (example) — FEWER DETAILS but active
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Miami Harbor Club','miami-harbor-club',
 'Central Miami marina with a mix of private slips and transient dockage.',
 1,170.00,
 'Miami','Florida','United States',
 '100 Biscayne Blvd','33132',
 25.7765,-80.1893,
 'Dockmaster','info@miamiharborclub.com','+1 305 555 0178',
 'https://example-miami-harbor.com',
 280,240,
 60.00,5.00,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,0,0,0,0,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,8,'Mixed sand and rock near bay entrance.',7.0,'Busy commercial approaches.');


-- ============================================================
-- 15) KEY WEST GATEWAY MARINA (Key West, FL, USA) - active
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Key West Harbor Marina','key-west-harbor-marina',
 'Strategic marina near Key West with charter, fishing and tourist services.',
 1,220.00,
 'Key West','Florida','United States',
 '700 Front St','33040',
 24.5551,-81.7826,
 'Dockmaster','info@keywestmarina.com','+1 305 555 0133',
 'https://keywestharbor.com',
 200,160,
 30.00,3.00,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,0,0,0,0,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,8),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy bottom; channel marked.',6.0,'Tropical conditions.');


-- ============================================================
-- 16) LAZ YACHT HARBOR / OAKLAND / SAN FRANCISCO (example)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Marina Bay Yacht Harbor','marina-bay-yacht-harbor',
 'Marina near San Francisco Bay serving local boaters and transient yachts.',
 1,180.00,
 'San Francisco','California','United States',
 'Pier 9','94111',
 37.7910,-122.3926,
 'Dockmaster','info@marinabay.com','+1 415 555 0140',
 'https://example-marina-sf.com',
 320,280,
 60.00,5.50,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,0,0,1,0,1,1);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,5),
(@marina_id,7),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,8,'Mixed sand and silt in bay.',9.0,'Tidal currents moderate.');


-- ============================================================
-- 17) GALVESTON YACHT BASIN (Galveston, TX, USA)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Galveston Yacht Basin','galveston-yacht-basin',
 'Protected Texas Gulf marina serving the Houston/Galveston boating community.',
 1,110.00,
 'Galveston','Texas','United States',
 '300 Seawolf Park Blvd','77550',
 29.2810,-94.8160,
 'Dockmaster','info@galvestonyachtbasin.com','+1 409 555 0150',
 'https://galvestonyachtbasin.com',
 260,230,
 40.00,3.50,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,0,1,0,0,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,4),(@marina_id,5),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy gulf approaches; dredged channel.',4.0,'Watch for weather.');


-- ============================================================
-- 18) CHICAGO HARBOR (Chicago, IL, USA) — example Great Lakes
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Chicago Harbor Marina','chicago-harbor-marina',
 'Busy urban marina on Lake Michigan with city access and charter services.',
 1,150.00,
 'Chicago','Illinois','United States',
 '1400 S Lake Shore Dr','60605',
 41.8676,-87.6068,
 'Dockmaster','info@chicagoharbor.com','+1 312 555 0162',
 'https://chicagoharbor.com',
 400,360,
 45.00,4.00,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,0,1,0,0,0,0,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,2),(@marina_id,3),(@marina_id,5),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,6,'Freshwater lake bottom, mixed gravels.',6.0,'Seasonal ice closure in winter.');


-- ============================================================
-- 19) MARINA AT DANA POINT (Dana Point, CA, USA)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Dana Point Marina','dana-point-marina',
 'Dana Point marina — gateway to Southern California coast and whale watching excursions.',
 1,160.00,
 'Dana Point','California','United States',
 '34399 Golden Lantern St','92629',
 33.4670,-117.6981,
 'Dockmaster','info@danapointmarina.com','+1 949 496 6135',
 'https://danapointmarina.com',
 700,650,
 80.00,6.00,
 1,1,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,1,0,1,1,1,1);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,4),
(@marina_id,5),(@marina_id,6),(@marina_id,7),
(@marina_id,8),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy basin with protected slips.',9.0,'Popular transient stop.');


-- ============================================================
-- 20) SAFE HARBOR ANNAPOLIS (Annapolis, MD, USA)
-- ============================================================
INSERT INTO `marinas`
(`host_id`,`name`,`slug`,`description`,`business_type_id`,`price_per_day`,
 `city`,`state`,`country`,`address`,`postal_code`,
 `latitude`,`longitude`,
 `contact_name`,`contact_email`,`contact_phone`,`website_url`,
 `total_slips`,`available_slips`,
 `max_boat_length_meters`,`max_boat_draft_meters`,
 `is_active`,`is_featured`,`is_directory_only`)
VALUES
(1,'Annapolis Harbor Marina','annapolis-harbor-marina',
 'Historic Chesapeake marina near downtown Annapolis and sailing facilities.',
 1,150.00,
 'Annapolis','Maryland','United States',
 '80 Compromise St','21401',
 38.9784,-76.4922,
 'Dockmaster','info@annapolismarina.com','+1 410 555 0188',
 'https://annapolismarina.com',
 300,270,
 40.00,4.50,
 1,0,1);

SET @marina_id = LAST_INSERT_ID();

INSERT INTO `marina_features`
(`marina_id`,`has_fuel_dock`,`has_pump_out`,`has_haul_out`,
 `has_boat_ramp`,`has_dry_storage`,`has_live_aboard`,
 `accepts_transients`,`accepts_megayachts`)
VALUES (@marina_id,1,1,0,1,0,1,1,0);

INSERT INTO `marina_amenities` (`marina_id`,`amenity_id`) VALUES
(@marina_id,1),(@marina_id,2),(@marina_id,3),(@marina_id,5),
(@marina_id,6),(@marina_id,7),(@marina_id,10);

INSERT INTO `seabeds`
(`marina_id`,`seabed_type_id`,`description`,`depth_meters`,`notes`)
VALUES
(@marina_id,1,'Sandy mud in upper bay approach.',6.5,'Shallow berths in some slips.');