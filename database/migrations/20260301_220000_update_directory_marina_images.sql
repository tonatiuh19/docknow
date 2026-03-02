-- ============================================================
-- Migration: 20260301_220000_update_directory_marina_images.sql
-- Description: Set cover_image_url and gallery_image_urls for the 20
--              directory-only seed marinas using publicly available
--              Unsplash high-resolution marina/harbor photographs.
--
-- PRE-REQUISITE: 20260301_200000_example_insert_marina_host1.sql (slugs must exist)
--               20260301_120000_add_images_to_marinas.sql (columns must exist)
-- ============================================================

-- ============================================================
-- 1) MIAMI BEACH MARINA
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    'https://images.unsplash.com/photo-1579167728798-a1cf3d595960?w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'
  )
WHERE `slug` = 'miami-beach-marina';

-- ============================================================
-- 2) BAHIA MAR YACHTING CENTER
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=1200&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80'
  )
WHERE `slug` = 'bahia-mar-yachting-center';

-- ============================================================
-- 3) MARINA DEL REY HARBOR
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80'
  )
WHERE `slug` = 'marina-del-rey-harbor';

-- ============================================================
-- 4) SAFE HARBOR SUNROAD MARINA (San Diego)
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1587874522487-fe10e954d035?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    'https://images.unsplash.com/photo-1602702832064-c42b4a6efd97?w=1200&q=80',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=1200&q=80'
  )
WHERE `slug` = 'safe-harbor-sunroad-marina';

-- ============================================================
-- 5) NEWPORT HARBOR MARINA (Newport Beach, CA)
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
    'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80'
  )
WHERE `slug` = 'newport-harbor-marina';

-- ============================================================
-- 6) PIER 25 MARINA (New York)
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=1200&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80'
  )
WHERE `slug` = 'pier-25-marina';

-- ============================================================
-- 7) SAFE HARBOR ST. PETE MARINA (St. Petersburg, FL)
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=1200&q=80'
  )
WHERE `slug` = 'safe-harbor-st-pete-marina';

-- ============================================================
-- 8) CHARLESTON HARBOR MARINA
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1467346963849-5c8014a66da9?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'
  )
WHERE `slug` = 'charleston-harbor-marina';

-- ============================================================
-- 9) NEWPORT HARBOR MARINA (Newport, RI)
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1526934709557-35f3777499c4?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80'
  )
WHERE `slug` = 'newport-harbor-ri';

-- ============================================================
-- 10) PORTLAND HARBOR MARINA (Portland, ME)
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1526934709557-35f3777499c4?w=1200&q=80',
    'https://images.unsplash.com/photo-1467346963849-5c8014a66da9?w=1200&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80'
  )
WHERE `slug` = 'portland-harbor-marina';

-- ============================================================
-- 11) IGY MARINA CABO SAN LUCAS
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
    'https://images.unsplash.com/photo-1579167728798-a1cf3d595960?w=1200&q=80'
  )
WHERE `slug` = 'igy-marina-cabo-san-lucas';

-- ============================================================
-- 12) MARINA VALLARTA (Puerto Vallarta)
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80'
  )
WHERE `slug` = 'marina-vallarta';

-- ============================================================
-- 13) MARINA EL CID MAZATLÁN
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1579167728798-a1cf3d595960?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=1200&q=80'
  )
WHERE `slug` = 'marina-el-cid-mazatlan';

-- ============================================================
-- 14) MIAMI HARBOR CLUB
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1569974498991-d3c12a504f95?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
    'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80'
  )
WHERE `slug` = 'miami-harbor-club';

-- ============================================================
-- 15) KEY WEST HARBOR MARINA
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
    'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80'
  )
WHERE `slug` = 'key-west-harbor-marina';

-- ============================================================
-- 16) MARINA BAY YACHT HARBOR (San Francisco)
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1602702832064-c42b4a6efd97?w=1200&q=80',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80'
  )
WHERE `slug` = 'marina-bay-yacht-harbor';

-- ============================================================
-- 17) GALVESTON YACHT BASIN
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=1200&q=80',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80'
  )
WHERE `slug` = 'galveston-yacht-basin';

-- ============================================================
-- 18) CHICAGO HARBOR MARINA
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80',
    'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80'
  )
WHERE `slug` = 'chicago-harbor-marina';

-- ============================================================
-- 19) DANA POINT MARINA
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1602702832064-c42b4a6efd97?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80'
  )
WHERE `slug` = 'dana-point-marina';

-- ============================================================
-- 20) ANNAPOLIS HARBOR MARINA
-- ============================================================
UPDATE `marinas` SET
  `cover_image_url`    = 'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=1200&q=80',
  `gallery_image_urls` = JSON_ARRAY(
    'https://images.unsplash.com/photo-1526934709557-35f3777499c4?w=1200&q=80',
    'https://images.unsplash.com/photo-1467346963849-5c8014a66da9?w=1200&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80'
  )
WHERE `slug` = 'annapolis-harbor-marina';
