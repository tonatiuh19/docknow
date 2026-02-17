-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 16, 2026 at 06:36 PM
-- Server version: 5.7.23-23
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alanchat_docknow`
--

DELIMITER $$
--
-- Procedures
--
$$

$$

$$

$$

$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `amenity_types`
--

CREATE TABLE `amenity_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('utility','facility','service') COLLATE utf8mb4_unicode_ci DEFAULT 'facility',
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `amenity_types`
--

INSERT INTO `amenity_types` (`id`, `name`, `slug`, `icon`, `category`, `is_active`) VALUES
(1, 'Electricity', 'electricity', 'FiZap', 'utility', 1),
(2, 'Water', 'water', 'FiDroplet', 'utility', 1),
(3, 'WiFi', 'wifi', 'FiWifi', 'utility', 1),
(4, 'Fuel', 'fuel', 'MdLocalGasStation', 'service', 1),
(5, 'Restrooms', 'restrooms', 'MdWc', 'facility', 1),
(6, 'Showers', 'showers', 'MdShower', 'facility', 1),
(7, 'Security', 'security', 'FiShield', 'service', 1),
(8, 'Restaurant', 'restaurant', 'FiCoffee', 'facility', 1),
(9, 'Laundry', 'laundry', 'MdLocalLaundryService', 'facility', 1),
(10, 'Parking', 'parking', 'MdLocalParking', 'facility', 1);

-- --------------------------------------------------------

--
-- Table structure for table `anchorages`
--

CREATE TABLE `anchorages` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `anchorage_type_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `max_depth_meters` decimal(8,2) DEFAULT NULL,
  `min_depth_meters` decimal(8,2) DEFAULT NULL,
  `capacity` int(10) UNSIGNED DEFAULT NULL,
  `price_per_day` decimal(10,2) DEFAULT NULL,
  `protection_level` enum('excellent','good','moderate','poor') COLLATE utf8mb4_unicode_ci DEFAULT 'good',
  `is_available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `anchorages`
--

INSERT INTO `anchorages` (`id`, `marina_id`, `anchorage_type_id`, `name`, `description`, `latitude`, `longitude`, `max_depth_meters`, `min_depth_meters`, `capacity`, `price_per_day`, `protection_level`, `is_available`, `created_at`, `updated_at`) VALUES
(9, 10, 1, 'Golden Gate Protected Anchorage', 'Well-protected anchorage with stunning Golden Gate Bridge views, suitable for overnight stays', 37.80293000, -122.44377000, 18.00, 12.00, 25, 45.00, 'excellent', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(10, 10, 3, 'Richardson Bay Anchorage', 'Popular bay anchorage with good protection from prevailing winds', 37.86150000, -122.48500000, 15.00, 8.00, 40, 35.00, 'good', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(11, 11, 2, 'Tampa Bay Open Anchorage', 'Open water anchorage with easy Gulf access, great for fishing', 27.94552000, -82.52053000, 12.00, 6.00, 30, 25.00, 'moderate', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(12, 11, 3, 'Hillsborough Bay Anchorage', 'Sheltered bay anchorage perfect for weekend getaways', 27.92000000, -82.46000000, 10.00, 4.00, 20, 30.00, 'good', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(13, 12, 4, 'Government Cut Anchorage', 'Premium harbor anchorage with concierge services available', 25.76135000, -80.13505000, 20.00, 15.00, 15, 85.00, 'excellent', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(14, 12, 1, 'Star Island Anchorage', 'Exclusive protected anchorage for luxury vessels', 25.78335000, -80.15005000, 25.00, 18.00, 10, 120.00, 'excellent', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(15, 13, 2, 'Galveston Bay Anchorage', 'Open anchorage with excellent fishing access to Gulf waters', 29.31265000, -94.79288000, 8.00, 3.00, 35, 20.00, 'moderate', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(16, 13, 3, 'Offats Bayou Anchorage', 'Protected bayou anchorage ideal for sport fishing boats', 29.29500000, -94.82000000, 6.00, 2.00, 25, 22.00, 'good', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(17, 14, 1, 'Elliott Bay Anchorage', 'Protected anchorage with stunning mountain and city views', 47.63854000, -122.39146000, 30.00, 20.00, 30, 40.00, 'excellent', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(18, 14, 3, 'Puget Sound Anchorage', 'Popular sailing anchorage with access to pristine cruising grounds', 47.65000000, -122.35000000, 45.00, 25.00, 50, 35.00, 'good', 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02');

-- --------------------------------------------------------

--
-- Table structure for table `anchorage_types`
--

CREATE TABLE `anchorage_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `anchorage_types`
--

INSERT INTO `anchorage_types` (`id`, `name`, `slug`, `description`, `icon`, `is_active`) VALUES
(1, 'Protected Anchorage', 'protected', 'Well-protected from wind and waves', '🛡️', 1),
(2, 'Open Anchorage', 'open', 'Exposed to weather conditions', '🌊', 1),
(3, 'Bay Anchorage', 'bay', 'Anchoring in a bay or cove', '🏖️', 1),
(4, 'Harbor Anchorage', 'harbor', 'Within harbor limits', '⚓', 1),
(5, 'Emergency Anchorage', 'emergency', 'For emergency use only', '🚨', 1);

-- --------------------------------------------------------

--
-- Table structure for table `blocked_dates`
--

CREATE TABLE `blocked_dates` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `slip_id` int(10) UNSIGNED DEFAULT NULL,
  `blocked_date` date NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Unavailable',
  `created_by` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `start_time` time DEFAULT NULL COMMENT 'If NULL, blocked all day',
  `end_time` time DEFAULT NULL COMMENT 'If NULL, blocked all day',
  `is_all_day` tinyint(1) DEFAULT '1' COMMENT '1 = all day, 0 = specific time range'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `boats`
--

CREATE TABLE `boats` (
  `id` int(10) UNSIGNED NOT NULL,
  `owner_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `boat_type_id` int(10) UNSIGNED DEFAULT NULL,
  `year` year(4) DEFAULT NULL,
  `length_meters` decimal(8,2) NOT NULL,
  `width_meters` decimal(8,2) DEFAULT NULL,
  `draft_meters` decimal(8,2) DEFAULT NULL,
  `home_marina` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registration_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insurance_provider` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insurance_policy_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `boats`
--

INSERT INTO `boats` (`id`, `owner_id`, `name`, `model`, `manufacturer`, `boat_type_id`, `year`, `length_meters`, `width_meters`, `draft_meters`, `home_marina`, `registration_number`, `insurance_provider`, `insurance_policy_number`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 7, 'Boat Test', 'Mustang Ocean', 'Ford', 3, '2025', 6.00, 3.00, 1.00, NULL, NULL, NULL, NULL, 1, '2026-02-14 05:56:20', '2026-02-14 05:56:20');

-- --------------------------------------------------------

--
-- Table structure for table `boat_types`
--

CREATE TABLE `boat_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `boat_types`
--

INSERT INTO `boat_types` (`id`, `name`, `slug`, `description`, `is_active`) VALUES
(1, 'Sailboat', 'sailboat', 'Sailing vessel powered primarily by wind', 1),
(2, 'Motorboat', 'motorboat', 'Boat powered by motor/engine', 1),
(3, 'Catamaran', 'catamaran', 'Multi-hulled watercraft with two parallel hulls', 1),
(4, 'Yacht', 'yacht', 'Recreational boat or ship', 1),
(5, 'Fishing Boat', 'fishing-boat', 'Boat used for catching fish', 1),
(6, 'Speedboat', 'speedboat', 'Fast motorboat designed for speed', 1);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `slip_id` int(10) UNSIGNED DEFAULT NULL,
  `boat_id` int(10) UNSIGNED NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `total_days` int(10) UNSIGNED NOT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `service_fee` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed','pending_approval') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `requires_approval` tinyint(1) DEFAULT '0' COMMENT 'Whether this booking needs host approval',
  `approved_at` timestamp NULL DEFAULT NULL COMMENT 'When booking was approved by host',
  `approved_by` int(10) UNSIGNED DEFAULT NULL COMMENT 'Host user who approved',
  `stripe_payment_intent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `special_requests` text COLLATE utf8mb4_unicode_ci,
  `pre_checkout_completed` tinyint(1) DEFAULT '0',
  `pre_checkout_completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `marina_id`, `slip_id`, `boat_id`, `check_in_date`, `check_out_date`, `total_days`, `price_per_day`, `subtotal`, `service_fee`, `discount_amount`, `total_amount`, `coupon_code`, `status`, `requires_approval`, `approved_at`, `approved_by`, `stripe_payment_intent_id`, `cancelled_at`, `cancellation_reason`, `special_requests`, `pre_checkout_completed`, `pre_checkout_completed_at`, `created_at`, `updated_at`) VALUES
(14, 7, 10, 29, 2, '2026-02-15', '2026-02-18', 3, 185.00, 555.00, 55.50, 0.00, 610.50, NULL, 'confirmed', 0, NULL, NULL, 'pi_3T0c4eGnfvtfvDAr0jBo5RiJ', NULL, NULL, NULL, 0, NULL, '2026-02-14 06:11:24', '2026-02-14 06:21:09'),
(15, 7, 10, 28, 2, '2026-02-22', '2026-02-25', 3, 185.00, 555.00, 55.50, 0.00, 610.50, NULL, 'pending', 0, NULL, NULL, 'pi_3T1YkiGnfvtfvDAr1O4Nld30', NULL, NULL, NULL, 0, NULL, '2026-02-16 20:50:44', '2026-02-16 20:50:44');

-- --------------------------------------------------------

--
-- Table structure for table `cancellation_requests`
--

CREATE TABLE `cancellation_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `booking_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `refund_percentage` decimal(5,2) DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  `responded_by` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `content_pages`
--

CREATE TABLE `content_pages` (
  `id` int(10) UNSIGNED NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_es` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_en` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_es` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `content_pages`
--

INSERT INTO `content_pages` (`id`, `slug`, `title_en`, `title_es`, `content_en`, `content_es`, `updated_at`) VALUES
(1, 'terms-of-service', 'Terms of Service', 'Términos de Servicio', '<h1>Terms of Service</h1>', '<h1>Términos de Servicio</h1>', '2025-11-29 23:06:28'),
(2, 'privacy-policy', 'Privacy Policy', 'Política de Privacidad', '<h1>Privacy Policy</h1>', '<h1>Política de Privacidad</h1>', '2025-11-29 23:06:28');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED DEFAULT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` enum('percentage','fixed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_days` int(10) UNSIGNED DEFAULT NULL,
  `max_uses` int(10) UNSIGNED DEFAULT NULL,
  `times_used` int(10) UNSIGNED DEFAULT '0',
  `valid_from` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `valid_until` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `marina_id`, `code`, `description`, `discount_type`, `discount_value`, `min_days`, `max_uses`, `times_used`, `valid_from`, `valid_until`, `is_active`, `created_at`, `updated_at`) VALUES
(4, NULL, 'FIRSTTIME', 'First time booking discount - any marina', 'percentage', 10.00, 2, 1000, 0, '2024-01-01 06:00:00', '2026-01-01 05:59:59', 1, '2025-11-29 23:46:15', '2025-11-29 23:46:15');

-- --------------------------------------------------------

--
-- Table structure for table `faq_categories`
--

CREATE TABLE `faq_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'FaQuestionCircle',
  `order_index` int(10) UNSIGNED DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faq_categories`
--

INSERT INTO `faq_categories` (`id`, `name`, `slug`, `description`, `icon`, `order_index`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Getting Started', 'getting-started', 'Learn the basics of using DockNow', 'FaRocket', 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(2, 'Booking & Reservations', 'booking-reservations', 'Everything about making and managing bookings', 'FaCalendarCheck', 2, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(3, 'Payments & Pricing', 'payments-pricing', 'Payment methods, refunds, and pricing information', 'FaCreditCard', 3, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(4, 'Marina Information', 'marina-information', 'Details about marinas, amenities, and locations', 'FaAnchor', 4, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(5, 'Account Management', 'account-management', 'Managing your DockNow account and profile', 'FaUser', 5, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(6, 'Cancellations & Refunds', 'cancellations-refunds', 'Cancellation policies and refund processes', 'FaUndoAlt', 6, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(7, 'Technical Support', 'technical-support', 'Technical issues and troubleshooting', 'FaTools', 7, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48');

-- --------------------------------------------------------

--
-- Table structure for table `faq_questions`
--

CREATE TABLE `faq_questions` (
  `id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_index` int(10) UNSIGNED DEFAULT '0',
  `views_count` int(10) UNSIGNED DEFAULT '0',
  `helpful_count` int(10) UNSIGNED DEFAULT '0',
  `not_helpful_count` int(10) UNSIGNED DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faq_questions`
--

INSERT INTO `faq_questions` (`id`, `category_id`, `question`, `answer`, `slug`, `order_index`, `views_count`, `helpful_count`, `not_helpful_count`, `is_featured`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'What is DockNow and how does it work?', 'DockNow is a marina slip booking platform that connects boaters with marinas worldwide. Simply search for available slips by location and dates, select your preferred marina, and book instantly with secure payment. You\'ll receive immediate confirmation and can manage your reservations through your account dashboard.', 'what-is-docknow', 1, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(2, 1, 'Do I need to create an account to book a slip?', 'Yes, you need to create a free account to complete a booking. This allows you to manage your reservations, save your boat details, and receive booking confirmations. Creating an account only takes a minute and uses secure, passwordless authentication.', 'need-account-to-book', 2, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(3, 1, 'How do I search for available marina slips?', 'Use our search bar on the homepage or marinas page. Enter your desired location, check-in and check-out dates, and optionally filter by boat length, amenities, and price range. You\'ll see all available marinas that match your criteria with real-time availability.', 'how-to-search-slips', 3, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(4, 2, 'How do I make a reservation?', 'After finding your preferred marina, click \"Book Now\", select your slip type and check-in/check-out dates, enter your boat details, and complete the secure payment. You\'ll receive instant confirmation via email with all booking details and marina contact information.', 'how-to-make-reservation', 1, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(5, 2, 'Can I modify my reservation after booking?', 'Reservation modifications depend on the marina\'s policies and availability. Log into your account, go to \"My Bookings\", and click \"Modify Reservation\". Some changes may incur additional fees or be subject to the marina\'s modification policy.', 'modify-reservation', 2, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(6, 2, 'What happens after I book a slip?', 'You\'ll receive an immediate booking confirmation email with your reservation details, marina contact information, check-in instructions, and any special requirements. You can also view all details in your account dashboard under \"My Bookings\".', 'after-booking', 3, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(7, 2, 'How far in advance can I book?', 'Booking availability varies by marina, but most allow reservations up to 12 months in advance. Popular locations and peak seasons fill up quickly, so we recommend booking as early as possible, especially for holiday periods and summer months.', 'how-far-advance-book', 4, 0, 0, 0, 0, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(8, 3, 'What payment methods do you accept?', 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processor. All transactions are encrypted and PCI-compliant for your security.', 'payment-methods', 1, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(9, 3, 'When will I be charged for my booking?', 'Payment is processed immediately upon booking confirmation. Some marinas may require a deposit only, with the remaining balance due before check-in. Full payment details are shown before you complete your reservation.', 'when-charged', 2, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(10, 3, 'Are there any additional fees?', 'The price shown includes the slip rental fee. Some marinas may charge additional fees for electricity, water usage, fuel, or other services directly. These are clearly indicated on the marina\'s listing page and in your booking confirmation.', 'additional-fees', 3, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(11, 3, 'Is my payment information secure?', 'Absolutely. All payments are processed through Stripe, a PCI Level 1 certified payment processor. We never store your complete credit card details on our servers. All transactions use 256-bit SSL encryption for maximum security.', 'payment-security', 4, 0, 0, 0, 0, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(12, 4, 'How do I know if a marina can accommodate my boat?', 'Each marina listing displays detailed specifications including maximum boat length, beam width, and draft depth. Always verify your boat\'s dimensions fit within the slip\'s specifications before booking. Contact the marina directly if you have specific requirements.', 'boat-accommodation', 1, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(13, 4, 'What amenities are included with my slip?', 'Amenities vary by marina and are clearly listed on each marina\'s page. Common amenities include electricity, water hookups, WiFi, restrooms, showers, and security. Premium marinas may offer additional services like fuel docks, pump-out stations, and concierge services.', 'included-amenities', 2, 0, 0, 0, 1, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(14, 4, 'Can I visit a marina before booking?', 'Yes! We encourage you to contact marinas directly to arrange a visit or ask questions. Contact information is available on each marina\'s listing page. Many marinas offer virtual tours or detailed photos to help with your decision.', 'visit-before-booking', 3, 0, 0, 0, 0, 1, '2026-01-30 19:41:48', '2026-01-30 19:41:48'),
(15, 5, 'How do I create an account?', 'Click \"Sign In\" at the top of any page, enter your email address, and we\'ll send you a secure verification code. No password needed! Enter the code to access your account. It\'s fast, secure, and hassle-free.', 'create-account', 1, 0, 0, 0, 1, 1, '2026-01-30 19:41:49', '2026-01-30 19:41:49'),
(16, 5, 'I forgot my password. What should I do?', 'DockNow uses passwordless authentication - you don\'t need to remember any passwords! Simply click \"Sign In\", enter your email, and we\'ll send you a new verification code each time you log in.', 'forgot-password', 2, 0, 0, 0, 1, 1, '2026-01-30 19:41:49', '2026-01-30 19:41:49'),
(17, 5, 'How do I update my profile information?', 'Log into your account and click on your profile icon, then select \"Settings\" or \"Profile\". You can update your name, email, phone number, boat details, and notification preferences from there.', 'update-profile', 3, 0, 0, 0, 0, 1, '2026-01-30 19:41:49', '2026-01-30 19:41:49'),
(18, 6, 'What is your cancellation policy?', 'Cancellation policies vary by marina. Most marinas offer free cancellation up to 48-72 hours before check-in. The specific cancellation policy is shown on the marina\'s listing and in your booking confirmation email. Late cancellations may incur fees.', 'cancellation-policy', 1, 0, 0, 0, 1, 1, '2026-01-30 19:41:49', '2026-01-30 19:41:49'),
(19, 6, 'How do I cancel my reservation?', 'Log into your account, go to \"My Bookings\", find your reservation, and click \"Cancel Booking\". Follow the prompts to confirm cancellation. You\'ll receive a cancellation confirmation email, and eligible refunds are processed within 5-10 business days.', 'how-to-cancel', 2, 0, 0, 0, 1, 1, '2026-01-30 19:41:49', '2026-01-30 19:41:49'),
(20, 6, 'How long do refunds take?', 'Refunds are processed immediately upon cancellation approval, but may take 5-10 business days to appear in your account depending on your bank or card issuer. You\'ll receive email confirmation once the refund is processed.', 'refund-timing', 3, 0, 0, 0, 1, 1, '2026-01-30 19:41:49', '2026-01-30 19:41:49'),
(21, 7, 'I\'m having trouble completing my booking. What should I do?', 'First, ensure you\'re using a supported browser (Chrome, Firefox, Safari, or Edge). Clear your cache and cookies, then try again. If the issue persists, please submit a support ticket with details about the error message you\'re seeing, and our team will assist you promptly.', 'booking-trouble', 1, 0, 0, 0, 1, 1, '2026-01-30 19:41:49', '2026-01-30 19:41:49'),
(22, 7, 'Why am I not receiving email confirmations?', 'Check your spam/junk folder first. Add support@docknow.app and noreply@docknow.app to your contacts to ensure our emails reach your inbox. If you still don\'t receive emails, submit a support ticket and we\'ll verify your email address and resend confirmations.', 'no-email-confirmation', 2, 0, 0, 0, 1, 1, '2026-01-30 19:41:49', '2026-01-30 19:41:49'),
(23, 7, 'The website is not loading properly. How can I fix this?', 'Try clearing your browser cache and cookies, or use a different browser. Ensure your internet connection is stable. If issues persist, try accessing the site in incognito/private mode. For ongoing problems, contact our support team with details about your browser and device.', 'site-not-loading', 3, 0, 0, 0, 0, 1, '2026-01-30 19:41:49', '2026-01-30 19:41:49');

-- --------------------------------------------------------

--
-- Table structure for table `guest_step_submissions`
--

CREATE TABLE `guest_step_submissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `booking_id` int(10) UNSIGNED NOT NULL,
  `step_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `form_data` json NOT NULL COMMENT 'JSON object containing all field submissions',
  `is_completed` tinyint(1) DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `verification_session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Guest submissions for pre-checkout steps';

-- --------------------------------------------------------

--
-- Table structure for table `guest_step_uploads`
--

CREATE TABLE `guest_step_uploads` (
  `id` int(10) UNSIGNED NOT NULL,
  `submission_id` int(10) UNSIGNED NOT NULL,
  `field_id` int(10) UNSIGNED NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int(10) UNSIGNED NOT NULL COMMENT 'Size in bytes',
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='File uploads for pre-checkout step fields';

-- --------------------------------------------------------

--
-- Table structure for table `home_visitors`
--

CREATE TABLE `home_visitors` (
  `id` int(11) NOT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `referrer` text COLLATE utf8mb4_unicode_ci,
  `country_code` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` enum('desktop','mobile','tablet','other') COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `browser` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landing_page` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visited_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `home_visitors`
--

INSERT INTO `home_visitors` (`id`, `session_id`, `ip_address`, `user_agent`, `referrer`, `country_code`, `city`, `device_type`, `browser`, `os`, `landing_page`, `visited_at`) VALUES
(1, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:04:14'),
(2, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:04:14'),
(3, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:06:15'),
(4, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:06:15'),
(5, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:23:26'),
(6, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:23:26'),
(7, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:26:09'),
(8, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:26:09'),
(9, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:28:50'),
(10, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:28:50'),
(11, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:30:08'),
(12, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:30:08'),
(13, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:32:59'),
(14, 'c86fbdd8-b9d2-478b-b6eb-00ef531a3098', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-05 01:32:59'),
(15, '3479d4b1-363b-44a1-b40b-f8776e85816c', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-06 18:33:19'),
(16, '3479d4b1-363b-44a1-b40b-f8776e85816c', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-06 18:33:19'),
(17, 'test-123', '::1', 'curl/8.7.1', NULL, NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-06 18:33:25'),
(18, 'test-validation-123', '::1', 'curl/8.7.1', NULL, NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-06 18:37:38'),
(19, '3479d4b1-363b-44a1-b40b-f8776e85816c', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-06 18:43:37'),
(20, '3479d4b1-363b-44a1-b40b-f8776e85816c', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-06 18:43:37'),
(21, 'f92b750c-5e41-4a63-a006-070110cc4efb', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 00:17:33'),
(22, 'f92b750c-5e41-4a63-a006-070110cc4efb', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 00:17:33'),
(23, 'f92b750c-5e41-4a63-a006-070110cc4efb', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 00:32:06'),
(24, 'f92b750c-5e41-4a63-a006-070110cc4efb', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 00:32:06'),
(25, 'aa2142e9-50ca-4e21-9f4e-d4e8d444a7f6', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 01:33:55'),
(26, 'aa2142e9-50ca-4e21-9f4e-d4e8d444a7f6', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 01:33:55'),
(27, 'aa2142e9-50ca-4e21-9f4e-d4e8d444a7f6', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 01:35:15'),
(28, 'aa2142e9-50ca-4e21-9f4e-d4e8d444a7f6', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 01:35:15'),
(29, 'aa2142e9-50ca-4e21-9f4e-d4e8d444a7f6', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 01:36:21'),
(30, '4a22e336-9a4e-499a-af88-84333e1b5427', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-07 02:44:05'),
(31, 'c65c1d72-1cf1-494a-bd8b-09443591c9c5', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-16 03:43:16'),
(32, '66db0363-a307-49d7-9644-4771bd4ac1b7', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-16 21:41:02'),
(33, '0164ba78-703a-417e-ade7-5ba791f812d7', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-19 04:55:34'),
(34, 'b3fd91b3-ecc5-408c-bfc2-4b887d8d3b4a', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-19 17:53:54'),
(35, 'b3fd91b3-ecc5-408c-bfc2-4b887d8d3b4a', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2025-12-19 17:56:54'),
(36, '67119b50-6fbe-4c39-9fe3-9e7170cc1c89', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2026-01-27 04:20:52'),
(37, '6c3fce64-df82-4678-9318-948a12322870', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2026-01-27 05:42:45'),
(38, 'b04ca797-e5de-435b-af8b-073d10841c65', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2026-01-27 15:53:37'),
(39, 'bc383af5-08f3-40c1-abbb-a67ae88207cd', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2026-01-29 20:52:43'),
(40, '3e8c754f-d2c9-4cf4-84d4-745045d5f59b', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2026-01-29 21:35:08'),
(41, '91d11dea-b28a-45d5-bd2a-ff4ee5d4d0d7', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15', 'http://localhost:3000/', NULL, NULL, 'desktop', 'safari', 'macos', '/', '2026-02-13 01:24:08'),
(42, '6b409635-9dba-4133-bc08-c3fb791707ae', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'http://localhost:3000/', NULL, NULL, 'desktop', 'chrome', 'macos', '/', '2026-02-13 01:24:38');

-- --------------------------------------------------------

--
-- Stand-in structure for view `home_visitor_stats`
-- (See below for the actual view)
--
CREATE TABLE `home_visitor_stats` (
`visit_date` date
,`total_visits` bigint(21)
,`unique_visitors` bigint(21)
,`desktop_visits` decimal(23,0)
,`mobile_visits` decimal(23,0)
,`tablet_visits` decimal(23,0)
,`countries_count` bigint(21)
,`referrer_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `hosts`
--

CREATE TABLE `hosts` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED DEFAULT NULL,
  `role` enum('primary','manager','staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manager',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image_url` text COLLATE utf8mb4_unicode_ci,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Marina host accounts for CRM access';

--
-- Dumping data for table `hosts`
--

INSERT INTO `hosts` (`id`, `marina_id`, `role`, `email`, `full_name`, `phone`, `phone_code`, `country_code`, `profile_image_url`, `company_name`, `is_active`, `email_verified`, `created_at`, `updated_at`) VALUES
(1, 10, 'primary', 'axgoomez@gmail.com', 'Alex Gomez', '3121234567', '+52', 'MX', NULL, NULL, 1, 1, '2025-11-29 23:46:15', '2026-02-17 00:24:17');

-- --------------------------------------------------------

--
-- Table structure for table `host_sessions`
--

CREATE TABLE `host_sessions` (
  `id` int(10) UNSIGNED NOT NULL,
  `host_id` int(10) UNSIGNED NOT NULL,
  `verification_code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Authentication sessions for hosts';

--
-- Dumping data for table `host_sessions`
--

INSERT INTO `host_sessions` (`id`, `host_id`, `verification_code`, `is_verified`, `expires_at`, `created_at`) VALUES
(1, 1, '877634', 1, '2025-12-03 03:43:18', '2025-12-03 03:42:50'),
(2, 1, '906284', 1, '2025-12-03 03:50:41', '2025-12-03 03:50:28'),
(3, 1, '375912', 1, '2025-12-05 01:15:10', '2025-12-05 01:14:50'),
(4, 1, '296150', 1, '2025-12-05 01:33:23', '2025-12-05 01:33:12'),
(5, 1, '926862', 1, '2025-12-07 00:18:07', '2025-12-07 00:17:52'),
(6, 1, '158315', 1, '2025-12-07 00:19:05', '2025-12-07 00:18:53'),
(7, 1, '230261', 1, '2025-12-07 00:32:33', '2025-12-07 00:32:20'),
(8, 1, '847215', 1, '2025-12-16 03:44:02', '2025-12-16 03:43:42'),
(9, 1, '571364', 1, '2025-12-19 05:02:42', '2025-12-19 05:02:25'),
(10, 1, '670761', 1, '2025-12-19 05:09:20', '2025-12-19 05:09:07'),
(11, 1, '951413', 1, '2025-12-19 05:11:24', '2025-12-19 05:11:09'),
(12, 1, '312251', 1, '2025-12-19 05:15:24', '2025-12-19 05:14:57'),
(13, 1, '580015', 1, '2025-12-19 05:16:41', '2025-12-19 05:16:27'),
(14, 1, '488846', 1, '2025-12-19 05:24:08', '2025-12-19 05:23:58'),
(15, 1, '821002', 1, '2025-12-19 17:56:20', '2025-12-19 17:56:03'),
(16, 1, '484777', 1, '2026-01-27 04:30:42', '2026-01-27 04:30:27'),
(17, 1, '671269', 0, '2026-02-13 01:39:17', '2026-02-13 01:24:17'),
(18, 1, '235745', 1, '2026-02-13 01:25:01', '2026-02-13 01:24:47'),
(19, 1, '606222', 1, '2026-02-16 22:12:12', '2026-02-16 22:11:56');

-- --------------------------------------------------------

--
-- Table structure for table `marinas`
--

CREATE TABLE `marinas` (
  `id` int(10) UNSIGNED NOT NULL,
  `host_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_type_id` int(10) UNSIGNED DEFAULT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `contact_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` text COLLATE utf8mb4_unicode_ci,
  `total_slips` int(10) UNSIGNED DEFAULT '0',
  `available_slips` int(10) UNSIGNED DEFAULT '0',
  `max_boat_length_meters` decimal(8,2) DEFAULT NULL,
  `max_boat_draft_meters` decimal(8,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marinas`
--

INSERT INTO `marinas` (`id`, `host_id`, `name`, `slug`, `description`, `business_type_id`, `price_per_day`, `city`, `state`, `country`, `address`, `postal_code`, `latitude`, `longitude`, `contact_name`, `contact_email`, `contact_phone`, `website_url`, `total_slips`, `available_slips`, `max_boat_length_meters`, `max_boat_draft_meters`, `is_active`, `is_featured`, `created_at`, `updated_at`) VALUES
(10, 1, 'Golden Gate Harbor Marina', 'golden-gate-harbor-marina', 'Premium full-service marina located in the heart of San Francisco Bay. Featuring 120 slips, full fuel services, and stunning views of the Golden Gate Bridge. Perfect for both short-term visits and long-term docking.', 1, 185.00, 'San Francisco', 'California', 'United States', '2000 Marina Boulevard, San Francisco, CA', '94123', 37.80493000, -122.44177000, 'Carlos Rodriguez', 'marina.owner1@docknow.com', '+1 (415) 555-0123', 'https://goldengateharbor.com', 15, 14, 40.00, 4.50, 1, 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(11, 1, 'Sunset Bay Marina', 'sunset-bay-marina', 'Affordable family-friendly marina on Florida\'s Gulf Coast. Features 80 slips, boat ramp, and beautiful sunset views. Perfect for weekend getaways and fishing trips. Clean facilities and friendly staff.', 1, 95.00, 'Tampa', 'Florida', 'United States', '4500 Westshore Drive, Tampa, FL', '33616', 27.94752000, -82.51853000, 'Sofia Martinez', 'marina.owner2@docknow.com', '+1 (813) 555-0456', 'https://sunsetbaymarina.com', 10, 10, 25.00, 3.00, 1, 0, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(12, 1, 'Miami Beach Yacht Club', 'miami-beach-yacht-club', 'Exclusive yacht club offering world-class amenities and services for luxury vessels. Features concierge services, valet parking, premium dining, and 24/7 security. Accommodates vessels up to 80 meters.', 4, 450.00, 'Miami Beach', 'Florida', 'United States', '1 Ocean Drive, Miami Beach, FL', '33139', 25.78135000, -80.13005000, 'Juan Perez', 'marina.owner3@docknow.com', '+1 (305) 555-0789', 'https://miamibeachyc.com', 6, 6, 80.00, 8.00, 1, 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(13, 1, 'Galveston Island Marina', 'galveston-island-marina', 'Historic marina on Galveston Island offering excellent access to Gulf fishing grounds. Features 65 slips, ice house, bait shop, and fish cleaning stations. Great for sport fishing and family boating.', 1, 125.00, 'Galveston', 'Texas', 'United States', '715 North Holiday Drive, Galveston, TX', '77550', 29.31065000, -94.79088000, 'Ana Lopez', 'marina.owner4@docknow.com', '+1 (409) 555-0321', 'https://galvestonmarina.com', 9, 9, 35.00, 4.00, 1, 0, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(14, 1, 'Pacific Harbor Marina', 'pacific-harbor-marina', 'Beautiful marina in the Pacific Northwest with stunning mountain and water views. Features covered slips, excellent storm protection, and access to pristine cruising grounds. Popular with sailing enthusiasts.', 1, 145.00, 'Seattle', 'Washington', 'United States', '2601 West Marina Place, Seattle, WA', '98199', 47.64054000, -122.38946000, 'Miguel Hernandez', 'marina.owner5@docknow.com', '+1 (206) 555-0654', 'https://pacificharbor.com', 9, 9, 45.00, 5.00, 1, 1, '2026-02-14 05:07:02', '2026-02-14 05:07:02');

-- --------------------------------------------------------

--
-- Table structure for table `marina_amenities`
--

CREATE TABLE `marina_amenities` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `amenity_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marina_amenities`
--

INSERT INTO `marina_amenities` (`id`, `marina_id`, `amenity_id`, `created_at`) VALUES
(135, 10, 1, '2026-02-14 05:07:02'),
(136, 10, 2, '2026-02-14 05:07:02'),
(137, 10, 3, '2026-02-14 05:07:02'),
(138, 10, 4, '2026-02-14 05:07:02'),
(139, 10, 5, '2026-02-14 05:07:02'),
(140, 10, 6, '2026-02-14 05:07:02'),
(141, 10, 7, '2026-02-14 05:07:02'),
(142, 10, 8, '2026-02-14 05:07:02'),
(143, 10, 9, '2026-02-14 05:07:02'),
(144, 10, 10, '2026-02-14 05:07:02'),
(145, 11, 1, '2026-02-14 05:07:02'),
(146, 11, 2, '2026-02-14 05:07:02'),
(147, 11, 3, '2026-02-14 05:07:02'),
(148, 11, 4, '2026-02-14 05:07:02'),
(149, 11, 5, '2026-02-14 05:07:02'),
(150, 11, 6, '2026-02-14 05:07:02'),
(151, 11, 10, '2026-02-14 05:07:02'),
(152, 12, 1, '2026-02-14 05:07:02'),
(153, 12, 2, '2026-02-14 05:07:02'),
(154, 12, 3, '2026-02-14 05:07:02'),
(155, 12, 4, '2026-02-14 05:07:02'),
(156, 12, 5, '2026-02-14 05:07:02'),
(157, 12, 6, '2026-02-14 05:07:02'),
(158, 12, 7, '2026-02-14 05:07:02'),
(159, 12, 8, '2026-02-14 05:07:02'),
(160, 12, 9, '2026-02-14 05:07:02'),
(161, 12, 10, '2026-02-14 05:07:02'),
(162, 13, 1, '2026-02-14 05:07:02'),
(163, 13, 2, '2026-02-14 05:07:02'),
(164, 13, 4, '2026-02-14 05:07:02'),
(165, 13, 5, '2026-02-14 05:07:02'),
(166, 13, 6, '2026-02-14 05:07:02'),
(167, 13, 10, '2026-02-14 05:07:02'),
(168, 14, 1, '2026-02-14 05:07:02'),
(169, 14, 2, '2026-02-14 05:07:02'),
(170, 14, 3, '2026-02-14 05:07:02'),
(171, 14, 4, '2026-02-14 05:07:02'),
(172, 14, 5, '2026-02-14 05:07:02'),
(173, 14, 6, '2026-02-14 05:07:02'),
(174, 14, 7, '2026-02-14 05:07:02'),
(175, 14, 9, '2026-02-14 05:07:02'),
(176, 14, 10, '2026-02-14 05:07:02');

-- --------------------------------------------------------

--
-- Table structure for table `marina_business_types`
--

CREATE TABLE `marina_business_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marina_business_types`
--

INSERT INTO `marina_business_types` (`id`, `name`, `slug`, `description`, `is_active`) VALUES
(1, 'Full Service Marina', 'full-service-marina', 'Complete marina with wet slips, fuel, and full amenities', 1),
(2, 'Dry Storage Marina', 'dry-storage-marina', 'Marina specializing in dry boat storage', 1),
(3, 'Private Port', 'private-port', 'Private docking facility', 1),
(4, 'Yacht Club', 'yacht-club', 'Private club with marina facilities', 1);

-- --------------------------------------------------------

--
-- Table structure for table `marina_features`
--

CREATE TABLE `marina_features` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `has_fuel_dock` tinyint(1) DEFAULT '0',
  `has_pump_out` tinyint(1) DEFAULT '0',
  `has_haul_out` tinyint(1) DEFAULT '0',
  `has_boat_ramp` tinyint(1) DEFAULT '0',
  `has_dry_storage` tinyint(1) DEFAULT '0',
  `has_live_aboard` tinyint(1) DEFAULT '0',
  `max_haul_out_weight_tons` decimal(10,2) DEFAULT NULL,
  `accepts_transients` tinyint(1) DEFAULT '1',
  `accepts_megayachts` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marina_features`
--

INSERT INTO `marina_features` (`id`, `marina_id`, `has_fuel_dock`, `has_pump_out`, `has_haul_out`, `has_boat_ramp`, `has_dry_storage`, `has_live_aboard`, `max_haul_out_weight_tons`, `accepts_transients`, `accepts_megayachts`, `updated_at`) VALUES
(16, 10, 1, 1, 1, 0, 1, 1, 50.00, 1, 1, '2026-02-14 05:07:02'),
(17, 11, 1, 1, 0, 1, 0, 0, NULL, 1, 0, '2026-02-14 05:07:02'),
(18, 12, 1, 1, 1, 0, 0, 1, 200.00, 1, 1, '2026-02-14 05:07:02'),
(19, 13, 1, 1, 0, 1, 1, 0, NULL, 1, 0, '2026-02-14 05:07:02'),
(20, 14, 1, 1, 1, 0, 0, 1, 75.00, 1, 0, '2026-02-14 05:07:02');

-- --------------------------------------------------------

--
-- Table structure for table `marina_images`
--

CREATE TABLE `marina_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int(11) DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marina_images`
--

INSERT INTO `marina_images` (`id`, `marina_id`, `image_url`, `title`, `display_order`, `is_primary`, `created_at`) VALUES
(41, 10, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600', 'Golden Gate Bridge View', 1, 1, '2026-02-14 05:07:02'),
(42, 10, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600', 'Marina Overview', 2, 0, '2026-02-14 05:07:02'),
(43, 10, 'https://images.unsplash.com/photo-1565034946487-077786996e27?w=800&h=600', 'Dock Facilities', 3, 0, '2026-02-14 05:07:02'),
(44, 11, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600', 'Sunset Views', 1, 1, '2026-02-14 05:07:02'),
(45, 11, 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600', 'Marina Docks', 2, 0, '2026-02-14 05:07:02'),
(46, 11, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600', 'Boat Ramp', 3, 0, '2026-02-14 05:07:02'),
(47, 12, 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&h=600', 'Luxury Yachts', 1, 1, '2026-02-14 05:07:02'),
(48, 12, 'https://images.unsplash.com/photo-1586985564150-50bfde4ba669?w=800&h=600', 'Club Facilities', 2, 0, '2026-02-14 05:07:02'),
(49, 12, 'https://images.unsplash.com/photo-1597149885569-564ccaa5dd9b?w=800&h=600', 'Premium Services', 3, 0, '2026-02-14 05:07:02'),
(50, 13, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600', 'Fishing Boats', 1, 1, '2026-02-14 05:07:02'),
(51, 13, 'https://images.unsplash.com/photo-1544551763-77f98d6e4025?w=800&h=600', 'Marina Entrance', 2, 0, '2026-02-14 05:07:02'),
(52, 13, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600', 'Gulf Access', 3, 0, '2026-02-14 05:07:02'),
(53, 14, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600', 'Mountain Views', 1, 1, '2026-02-14 05:07:02'),
(54, 14, 'https://images.unsplash.com/photo-1551946208-de362df5eb1a?w=800&h=600', 'Covered Slips', 2, 0, '2026-02-14 05:07:02'),
(55, 14, 'https://images.unsplash.com/photo-1592506494411-a4eca6c3c5e1?w=800&h=600', 'Sailing Access', 3, 0, '2026-02-14 05:07:02');

-- --------------------------------------------------------

--
-- Table structure for table `marina_pre_checkout_steps`
--

CREATE TABLE `marina_pre_checkout_steps` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `step_order` int(10) UNSIGNED NOT NULL DEFAULT '1',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_required` tinyint(1) DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `external_validation` json DEFAULT NULL COMMENT 'External validation configuration (Stripe Identity, Onfido, etc.)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configurable pre-checkout steps that guests must complete';

-- --------------------------------------------------------

--
-- Table structure for table `moorings`
--

CREATE TABLE `moorings` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `mooring_type_id` int(10) UNSIGNED NOT NULL,
  `mooring_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `max_boat_length_meters` decimal(8,2) NOT NULL,
  `max_boat_weight_tons` decimal(10,2) DEFAULT NULL,
  `depth_meters` decimal(8,2) DEFAULT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `moorings`
--

INSERT INTO `moorings` (`id`, `marina_id`, `mooring_type_id`, `mooring_number`, `description`, `max_boat_length_meters`, `max_boat_weight_tons`, `depth_meters`, `price_per_day`, `is_available`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES
(9, 10, 1, 'MB-01', 'Fixed mooring ball in protected waters with Golden Gate views', 15.24, 20.00, 15.00, 75.00, 1, 37.80393000, -122.44277000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(10, 10, 1, 'MB-02', 'Premium mooring ball suitable for larger sailboats', 18.29, 30.00, 18.00, 85.00, 1, 37.80493000, -122.44177000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(11, 10, 2, 'SM-01', 'Traditional swing mooring in Sausalito area', 12.19, 15.00, 12.00, 65.00, 1, 37.85900000, -122.48200000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(12, 11, 1, 'TB-01', 'Fixed mooring ball in Tampa Bay with easy Gulf access', 12.19, 12.00, 8.00, 45.00, 1, 27.94652000, -82.51753000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(13, 11, 1, 'TB-02', 'Family-friendly mooring ball perfect for weekend trips', 10.67, 8.00, 6.00, 40.00, 1, 27.94852000, -82.51953000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(14, 11, 2, 'TS-01', 'Swing mooring near fishing grounds', 9.14, 6.00, 5.00, 35.00, 1, 27.95000000, -82.52000000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(15, 12, 4, 'MM-01', 'Mediterranean-style mooring for luxury yachts', 30.48, 100.00, 25.00, 180.00, 1, 25.78035000, -80.13105000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(16, 12, 1, 'MB-VIP', 'VIP mooring ball with concierge services', 24.38, 60.00, 20.00, 150.00, 1, 25.78235000, -80.12905000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(17, 12, 5, 'AS-01', 'Alongside mooring for mega yachts', 45.72, 200.00, 30.00, 250.00, 1, 25.78135000, -80.13205000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(18, 13, 1, 'GB-01', 'Fixed mooring ball near fishing channels', 10.67, 10.00, 4.00, 30.00, 1, 29.31165000, -94.79188000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(19, 13, 2, 'GS-01', 'Swing mooring for sport fishing boats', 12.19, 12.00, 5.00, 35.00, 1, 29.31265000, -94.79088000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(20, 13, 1, 'GB-02', 'Mooring ball with easy Gulf access', 9.14, 8.00, 3.00, 28.00, 1, 29.31365000, -94.78988000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(21, 14, 1, 'PS-01', 'Fixed mooring in protected waters with mountain views', 15.24, 25.00, 25.00, 60.00, 1, 47.64154000, -122.38846000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(22, 14, 2, 'PS-02', 'Swing mooring popular with sailing enthusiasts', 18.29, 35.00, 30.00, 70.00, 1, 47.64254000, -122.38746000, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(23, 14, 1, 'EB-01', 'Elliott Bay mooring ball with city views', 12.19, 18.00, 20.00, 55.00, 1, 47.63954000, -122.39046000, '2026-02-14 05:07:02', '2026-02-14 05:07:02');

-- --------------------------------------------------------

--
-- Table structure for table `mooring_types`
--

CREATE TABLE `mooring_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mooring_types`
--

INSERT INTO `mooring_types` (`id`, `name`, `slug`, `description`, `icon`, `is_active`) VALUES
(1, 'Fixed Mooring Ball', 'fixed-ball', 'Permanent mooring ball anchored to seabed', '⚫', 1),
(2, 'Swing Mooring', 'swing', 'Traditional swing mooring system', '🔄', 1),
(3, 'Pile Mooring', 'pile', 'Mooring to fixed piles', '📍', 1),
(4, 'Med Mooring', 'med', 'Mediterranean style stern-to mooring', '🎯', 1),
(5, 'Alongside Mooring', 'alongside', 'Mooring alongside another vessel or pontoon', '🚢', 1);

-- --------------------------------------------------------

--
-- Table structure for table `points`
--

CREATE TABLE `points` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED DEFAULT NULL,
  `point_type_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `is_public` tinyint(1) DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `contact_info` text COLLATE utf8mb4_unicode_ci,
  `operating_hours` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `points`
--

INSERT INTO `points` (`id`, `marina_id`, `point_type_id`, `name`, `description`, `latitude`, `longitude`, `is_public`, `is_active`, `contact_info`, `operating_hours`, `created_at`, `updated_at`) VALUES
(21, 10, 1, 'Bay Area Fuel Dock', 'Full-service fuel dock with diesel and gasoline', 37.80593000, -122.44077000, 1, 1, 'VHF Channel 16', '06:00-20:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(22, 10, 2, 'Marina Pump-Out Station', 'Self-service pump-out facility', 37.80393000, -122.44377000, 1, 1, NULL, '24 hours', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(23, 10, 3, 'Waterfront Grill', 'Upscale marina restaurant with Golden Gate views', 37.80693000, -122.43977000, 1, 1, '(415) 555-0199', '11:00-22:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(24, 10, 5, 'Pacific Marine Supply', 'Complete marine chandlery and parts store', 37.80793000, -122.43877000, 1, 1, '(415) 555-0188', '08:00-18:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(25, 11, 1, 'Gulf Coast Fuel', 'Budget-friendly fuel dock', 27.94852000, -82.51653000, 1, 1, 'VHF Channel 9', '06:00-19:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(26, 11, 3, 'Sunset Café', 'Family restaurant with sunset views', 27.94652000, -82.51853000, 1, 1, '(813) 555-0299', '07:00-21:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(27, 11, 4, 'Marina Market', 'Convenience store and basic provisions', 27.94552000, -82.51953000, 1, 1, '(813) 555-0288', '06:00-22:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(28, 11, 7, 'Coin Laundry', 'Self-service laundry facilities', 27.94752000, -82.51753000, 1, 1, NULL, '24 hours', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(29, 12, 1, 'Luxury Marine Fuel', 'Premium fuel services for mega yachts', 25.78235000, -80.12805000, 0, 1, 'Concierge: (305) 555-0388', '24 hours', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(30, 12, 3, 'Ocean View Restaurant', 'Fine dining with ocean views', 25.78035000, -80.13205000, 0, 1, 'Reservations: (305) 555-0377', '18:00-23:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(31, 12, 6, 'Elite Marine Services', 'High-end yacht maintenance and repair', 25.78335000, -80.12905000, 0, 1, '(305) 555-0366', '07:00-17:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(32, 12, 8, 'Spa & Wellness Center', 'Full-service spa facilities for yacht guests', 25.78135000, -80.13105000, 0, 1, '(305) 555-0355', '09:00-19:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(33, 13, 1, 'Island Fuel Dock', 'Fuel dock specializing in fishing boats', 29.31365000, -94.78888000, 1, 1, 'VHF Channel 12', '05:00-19:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(34, 13, 4, 'Bait & Tackle Shop', 'Full-service bait shop and fishing supplies', 29.31165000, -94.79288000, 1, 1, '(409) 555-0488', '05:00-20:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(35, 13, 6, 'Gulf Coast Marine Repair', 'Engine repair and boat maintenance', 29.31265000, -94.79188000, 1, 1, '(409) 555-0477', '07:00-17:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(36, 13, 3, 'Fisherman\'s Wharf Restaurant', 'Casual dining with fresh seafood', 29.30965000, -94.79388000, 1, 1, '(409) 555-0466', '11:00-21:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(37, 14, 1, 'Northwest Marine Fuel', 'Full-service fuel dock with marine supplies', 47.64254000, -122.38646000, 1, 1, 'VHF Channel 78A', '07:00-19:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(38, 14, 3, 'Puget Sound Brewery', 'Waterfront brewery and restaurant', 47.64154000, -122.38946000, 1, 1, '(206) 555-0588', '11:00-23:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(39, 14, 5, 'Seattle Marine Center', 'Comprehensive marine supply store', 47.63954000, -122.39146000, 1, 1, '(206) 555-0577', '08:00-18:00', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(40, 14, 9, 'Harbor WiFi Zone', 'High-speed internet access point', 47.64054000, -122.38846000, 1, 1, 'Free WiFi: HarborNet', '24 hours', '2026-02-14 05:07:02', '2026-02-14 05:07:02');

-- --------------------------------------------------------

--
-- Table structure for table `point_types`
--

CREATE TABLE `point_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#0066CC',
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `point_types`
--

INSERT INTO `point_types` (`id`, `name`, `slug`, `description`, `icon`, `color`, `is_active`) VALUES
(1, 'Fuel Station', 'fuel', 'Fuel dock or station', '⛽', '#FF6B6B', 1),
(2, 'Pump-Out', 'pumpout', 'Waste pump-out facility', '🚽', '#4ECDC4', 1),
(3, 'Restaurant', 'restaurant', 'Restaurant or dining facility', '🍽️', '#FFE66D', 1),
(4, 'Grocery', 'grocery', 'Grocery store or provisioning', '🛒', '#95E1D3', 1),
(5, 'Marine Store', 'marine-store', 'Chandlery or marine supplies', '⚙️', '#FF9A8B', 1),
(6, 'Repair Shop', 'repair', 'Boat repair or maintenance', '🔧', '#6C5CE7', 1),
(7, 'Laundry', 'laundry', 'Laundry facility', '🧺', '#A8E6CF', 1),
(8, 'Shower', 'shower', 'Shower facilities', '🚿', '#74B9FF', 1),
(9, 'WiFi Zone', 'wifi', 'WiFi hotspot', '📶', '#FD79A8', 1),
(10, 'Hazard', 'hazard', 'Navigation hazard or danger', '⚠️', '#FF0000', 1);

-- --------------------------------------------------------

--
-- Table structure for table `pre_checkout_step_fields`
--

CREATE TABLE `pre_checkout_step_fields` (
  `id` int(10) UNSIGNED NOT NULL,
  `step_id` int(10) UNSIGNED NOT NULL,
  `field_order` int(10) UNSIGNED NOT NULL DEFAULT '1',
  `field_type` enum('text','textarea','email','phone','number','date','select','checkbox','radio','file','multiple_files') COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `placeholder` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `help_text` text COLLATE utf8mb4_unicode_ci,
  `is_required` tinyint(1) DEFAULT '1',
  `validation_rules` json DEFAULT NULL COMMENT 'JSON object with validation rules (min, max, pattern, etc.)',
  `options` json DEFAULT NULL COMMENT 'For select, radio, checkbox - array of options',
  `file_types_allowed` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Comma-separated file extensions for file uploads (e.g., pdf,jpg,png)',
  `max_file_size_mb` int(10) UNSIGNED DEFAULT '10',
  `max_files` int(10) UNSIGNED DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dynamic form fields for each pre-checkout step';

-- --------------------------------------------------------

--
-- Table structure for table `pre_checkout_temp_uploads`
--

CREATE TABLE `pre_checkout_temp_uploads` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `step_id` int(10) UNSIGNED NOT NULL,
  `field_id` int(10) UNSIGNED NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Full path from uploadPDFs API',
  `file_size` int(10) UNSIGNED NOT NULL COMMENT 'Size in bytes',
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional session identifier',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Temporary storage for pre-checkout file uploads before booking creation';

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(10) UNSIGNED NOT NULL,
  `review_id` int(10) UNSIGNED NOT NULL,
  `rating_category_id` int(10) UNSIGNED NOT NULL,
  `score` tinyint(3) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rating_categories`
--

CREATE TABLE `rating_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight` decimal(3,2) DEFAULT '1.00',
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rating_categories`
--

INSERT INTO `rating_categories` (`id`, `name`, `slug`, `description`, `icon`, `weight`, `is_active`) VALUES
(1, 'Facilities', 'facilities', 'Quality of marina facilities', '🏢', 1.20, 1),
(2, 'Location', 'location', 'Convenience and accessibility', '📍', 1.00, 1),
(3, 'Value', 'value', 'Value for money', '💰', 1.10, 1),
(4, 'Cleanliness', 'cleanliness', 'Cleanliness and maintenance', '✨', 1.15, 1),
(5, 'Staff', 'staff', 'Staff helpfulness and service', '👥', 1.10, 1),
(6, 'Security', 'security', 'Safety and security measures', '🔒', 1.05, 1);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `booking_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_approved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seabeds`
--

CREATE TABLE `seabeds` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED DEFAULT NULL,
  `anchorage_id` int(10) UNSIGNED DEFAULT NULL,
  `seabed_type_id` int(10) UNSIGNED NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `depth_meters` decimal(8,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seabeds`
--

INSERT INTO `seabeds` (`id`, `marina_id`, `anchorage_id`, `seabed_type_id`, `description`, `depth_meters`, `notes`, `created_at`) VALUES
(23, 10, 9, 2, 'Muddy bottom in protected anchorage provides excellent holding', 15.00, 'Excellent anchor holding, recommended for overnight stays', '2026-02-14 05:17:07'),
(24, 10, 10, 1, 'Sandy bottom with patches of mud, good holding quality', 12.00, 'Good holding in most weather conditions', '2026-02-14 05:17:07'),
(25, 11, 11, 1, 'Sandy bottom typical of Gulf Coast waters', 9.00, 'Good holding for most anchor types', '2026-02-14 05:17:07'),
(26, 11, 12, 8, 'Mixed sand and shell bottom composition', 7.00, 'Moderate holding, check anchor frequently', '2026-02-14 05:17:07'),
(27, 12, 13, 1, 'Clean sandy bottom in harbor waters', 18.00, 'Good holding, easy anchor retrieval', '2026-02-14 05:17:07'),
(28, 12, 14, 3, 'Clay bottom provides excellent anchor holding', 22.00, 'Excellent holding but may require windlass for retrieval', '2026-02-14 05:17:07'),
(29, 13, 15, 2, 'Muddy bottom with excellent holding characteristics', 6.00, 'Excellent holding, popular with fishing boats', '2026-02-14 05:17:07'),
(30, 13, 16, 8, 'Mixed mud and sand bottom in protected bayou', 4.00, 'Good holding in calm conditions', '2026-02-14 05:17:07'),
(31, 14, 17, 2, 'Deep mud bottom with excellent holding quality', 25.00, 'Excellent holding even in strong tidal currents', '2026-02-14 05:17:07'),
(32, 14, 18, 6, 'Gravel and sand mix typical of Pacific Northwest', 35.00, 'Moderate holding, suitable for short stays', '2026-02-14 05:17:07');

-- --------------------------------------------------------

--
-- Table structure for table `seabed_types`
--

CREATE TABLE `seabed_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `holding_quality` enum('excellent','good','moderate','poor') COLLATE utf8mb4_unicode_ci DEFAULT 'good',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seabed_types`
--

INSERT INTO `seabed_types` (`id`, `name`, `slug`, `description`, `holding_quality`, `icon`, `is_active`) VALUES
(1, 'Sand', 'sand', 'Sandy bottom - good holding', 'good', '🏖️', 1),
(2, 'Mud', 'mud', 'Muddy bottom - excellent holding', 'excellent', '🟤', 1),
(3, 'Clay', 'clay', 'Clay bottom - excellent holding', 'excellent', '🧱', 1),
(4, 'Rock', 'rock', 'Rocky bottom - poor holding', 'poor', '🪨', 1),
(5, 'Coral', 'coral', 'Coral bottom - poor holding, avoid anchoring', 'poor', '🪸', 1),
(6, 'Gravel', 'gravel', 'Gravel bottom - moderate holding', 'moderate', '⚪', 1),
(7, 'Weed', 'weed', 'Weedy bottom - poor holding', 'poor', '🌿', 1),
(8, 'Mixed', 'mixed', 'Mixed bottom composition', 'moderate', '🔀', 1);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `type` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `description` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `type`, `description`, `updated_at`) VALUES
(1, 'site_name', 'DockNow', 'string', 'Application name', '2025-11-29 23:06:28'),
(2, 'service_fee_percentage', '10', 'number', 'Service fee percentage', '2025-11-29 23:06:28'),
(3, 'stripe_mode', 'test', 'string', 'Stripe mode: test or live', '2025-11-29 23:06:28'),
(4, 'maintenance_mode', 'false', 'boolean', 'Site maintenance mode', '2025-11-29 23:06:28');

-- --------------------------------------------------------

--
-- Table structure for table `slips`
--

CREATE TABLE `slips` (
  `id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `slip_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `length_meters` decimal(8,2) NOT NULL,
  `width_meters` decimal(8,2) NOT NULL,
  `depth_meters` decimal(8,2) DEFAULT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `is_reserved` tinyint(1) DEFAULT '0',
  `has_power` tinyint(1) DEFAULT '1',
  `has_water` tinyint(1) DEFAULT '1',
  `power_capacity_amps` int(11) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `slips`
--

INSERT INTO `slips` (`id`, `marina_id`, `slip_number`, `length_meters`, `width_meters`, `depth_meters`, `price_per_day`, `is_available`, `is_reserved`, `has_power`, `has_water`, `power_capacity_amps`, `notes`, `created_at`, `updated_at`) VALUES
(27, 10, 'A1', 7.62, 3.05, 3.00, 165.00, 1, 0, 1, 1, 30, 'Prime location with Golden Gate view', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(28, 10, 'A2', 7.62, 3.05, 3.00, 165.00, 1, 0, 1, 1, 30, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(29, 10, 'A3', 9.14, 3.35, 3.20, 175.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(30, 10, 'A4', 9.14, 3.35, 3.20, 175.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(31, 10, 'A5', 9.14, 3.35, 3.20, 175.00, 0, 1, 1, 1, 50, 'Reserved for monthly tenant', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(32, 10, 'B1', 10.67, 3.66, 3.50, 185.00, 1, 0, 1, 1, 50, 'Protected slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(33, 10, 'B2', 10.67, 3.66, 3.50, 185.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(34, 10, 'B3', 12.19, 4.27, 4.00, 195.00, 1, 0, 1, 1, 100, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(35, 10, 'B4', 12.19, 4.27, 4.00, 195.00, 1, 0, 1, 1, 100, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(36, 10, 'B5', 12.19, 4.27, 4.00, 195.00, 1, 0, 1, 1, 100, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(37, 10, 'C1', 15.24, 4.57, 4.50, 225.00, 1, 0, 1, 1, 100, 'Suitable for large yachts', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(38, 10, 'C2', 15.24, 4.57, 4.50, 225.00, 1, 0, 1, 1, 100, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(39, 10, 'C3', 18.29, 5.49, 5.00, 275.00, 1, 0, 1, 1, 200, 'Premium large slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(40, 10, 'C4', 18.29, 5.49, 5.00, 275.00, 1, 0, 1, 1, 200, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(41, 10, 'D1', 21.34, 6.10, 5.50, 325.00, 1, 0, 1, 1, 200, 'Mega yacht slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(42, 11, '1', 6.71, 2.74, 2.50, 85.00, 1, 0, 1, 1, 30, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(43, 11, '2', 6.71, 2.74, 2.50, 85.00, 1, 0, 1, 1, 30, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(44, 11, '3', 7.62, 3.05, 2.80, 90.00, 1, 0, 1, 1, 30, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(45, 11, '4', 7.62, 3.05, 2.80, 90.00, 1, 0, 1, 1, 30, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(46, 11, '5', 9.14, 3.35, 3.00, 95.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(47, 11, '6', 9.14, 3.35, 3.00, 95.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(48, 11, '7', 10.67, 3.66, 3.20, 105.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(49, 11, '8', 10.67, 3.66, 3.20, 105.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(50, 11, '9', 12.19, 4.27, 3.50, 115.00, 1, 0, 1, 1, 100, 'Near boat ramp', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(51, 11, '10', 12.19, 4.27, 3.50, 115.00, 1, 0, 1, 1, 100, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(52, 12, 'VIP-1', 18.29, 5.49, 6.00, 420.00, 1, 0, 1, 1, 200, 'VIP slip with concierge service', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(53, 12, 'VIP-2', 21.34, 6.10, 7.00, 480.00, 1, 0, 1, 1, 200, 'Premium VIP slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(54, 12, 'VIP-3', 24.38, 7.32, 8.00, 550.00, 1, 0, 1, 1, 400, 'Super yacht slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(55, 12, 'MEGA-1', 30.48, 9.14, 8.00, 750.00, 1, 0, 1, 1, 400, 'Mega yacht berth with full services', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(56, 12, 'MEGA-2', 36.58, 10.67, 8.00, 950.00, 1, 0, 1, 1, 400, 'Large mega yacht berth', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(57, 12, 'MEGA-3', 45.72, 12.19, 8.00, 1250.00, 1, 0, 1, 1, 800, 'Ultra-luxury mega yacht berth', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(58, 13, 'F1', 7.62, 3.05, 2.80, 110.00, 1, 0, 1, 1, 30, 'Perfect for fishing boats', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(59, 13, 'F2', 7.62, 3.05, 2.80, 110.00, 1, 0, 1, 1, 30, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(60, 13, 'F3', 9.14, 3.35, 3.00, 120.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(61, 13, 'F4', 9.14, 3.35, 3.00, 120.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(62, 13, 'F5', 10.67, 3.66, 3.20, 130.00, 1, 0, 1, 1, 50, 'Near ice house', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(63, 13, 'F6', 10.67, 3.66, 3.20, 130.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(64, 13, 'S1', 12.19, 4.27, 3.50, 140.00, 1, 0, 1, 1, 100, 'Sport fishing slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(65, 13, 'S2', 12.19, 4.27, 3.50, 140.00, 1, 0, 1, 1, 100, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(66, 13, 'S3', 15.24, 4.57, 4.00, 165.00, 1, 0, 1, 1, 100, 'Large sport fishing slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(67, 14, 'S-1', 9.14, 3.35, 3.50, 135.00, 1, 0, 1, 1, 50, 'Perfect for sailboats', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(68, 14, 'S-2', 9.14, 3.35, 3.50, 135.00, 1, 0, 1, 1, 50, NULL, '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(69, 14, 'S-3', 10.67, 3.66, 4.00, 145.00, 1, 0, 1, 1, 50, 'Covered slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(70, 14, 'S-4', 10.67, 3.66, 4.00, 145.00, 1, 0, 1, 1, 50, 'Covered slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(71, 14, 'S-5', 12.19, 4.27, 4.50, 155.00, 1, 0, 1, 1, 100, 'Large sailboat slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(72, 14, 'S-6', 12.19, 4.27, 4.50, 155.00, 1, 0, 1, 1, 100, 'Covered large slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(73, 14, 'Y-1', 15.24, 4.57, 5.00, 175.00, 1, 0, 1, 1, 100, 'Cruising yacht slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(74, 14, 'Y-2', 15.24, 4.57, 5.00, 175.00, 1, 0, 1, 1, 100, 'Protected yacht slip', '2026-02-14 05:07:02', '2026-02-14 05:07:02'),
(75, 14, 'Y-3', 18.29, 5.49, 5.50, 205.00, 1, 0, 1, 1, 200, 'Large yacht slip with mountain view', '2026-02-14 05:07:02', '2026-02-14 05:07:02');

--
-- Triggers `slips`
--
DELIMITER $$
CREATE TRIGGER `tr_slips_after_delete` AFTER DELETE ON `slips` FOR EACH ROW BEGIN
    UPDATE marinas 
    SET 
        total_slips = (SELECT COUNT(*) FROM slips WHERE marina_id = OLD.marina_id),
        available_slips = (SELECT COUNT(*) FROM slips WHERE marina_id = OLD.marina_id AND is_available = 1)
    WHERE id = OLD.marina_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_slips_after_insert` AFTER INSERT ON `slips` FOR EACH ROW BEGIN
    UPDATE marinas 
    SET 
        total_slips = (SELECT COUNT(*) FROM slips WHERE marina_id = NEW.marina_id),
        available_slips = (SELECT COUNT(*) FROM slips WHERE marina_id = NEW.marina_id AND is_available = 1)
    WHERE id = NEW.marina_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_slips_after_update` AFTER UPDATE ON `slips` FOR EACH ROW BEGIN
    UPDATE marinas 
    SET 
        total_slips = (SELECT COUNT(*) FROM slips WHERE marina_id = NEW.marina_id),
        available_slips = (SELECT COUNT(*) FROM slips WHERE marina_id = NEW.marina_id AND is_available = 1)
    WHERE id = NEW.marina_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `stripe_identity_verifications`
--

CREATE TABLE `stripe_identity_verifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `step_id` int(10) UNSIGNED NOT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','verified','requires_input','canceled','processing') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `verified_data` json DEFAULT NULL COMMENT 'Verified identity data from Stripe',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores Stripe Identity verification sessions';

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('booking','payment','technical','account','marina','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `status` enum('open','in_progress','waiting_response','resolved','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` int(10) UNSIGNED DEFAULT NULL,
  `assigned_to` int(10) UNSIGNED DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_ticket_attachments`
--

CREATE TABLE `support_ticket_attachments` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_id` int(10) UNSIGNED NOT NULL,
  `message_id` int(10) UNSIGNED DEFAULT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL,
  `uploaded_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_ticket_messages`
--

CREATE TABLE `support_ticket_messages` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_id` int(10) UNSIGNED NOT NULL,
  `sender_type` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` int(10) UNSIGNED DEFAULT NULL,
  `sender_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_internal_note` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image_url` text COLLATE utf8mb4_unicode_ci,
  `user_type` enum('guest','host','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'guest',
  `stripe_customer_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `general_notifications` tinyint(1) DEFAULT '1',
  `marketing_notifications` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `full_name`, `date_of_birth`, `phone`, `phone_code`, `country_code`, `profile_image_url`, `user_type`, `stripe_customer_id`, `is_active`, `email_verified`, `general_notifications`, `marketing_notifications`, `created_at`, `updated_at`) VALUES
(7, 'axgoomez@gmail.com', 'Alex Gomez', '1993-08-19', '4741400363', '+52', 'MX', NULL, 'guest', NULL, 1, 0, 1, 1, '2026-02-14 04:18:03', '2026-02-14 04:18:03');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `verification_code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `verification_code`, `is_verified`, `expires_at`, `created_at`) VALUES
(23, 7, '657798', 1, '2026-02-14 04:18:33', '2026-02-14 04:18:03'),
(24, 7, '766860', 1, '2026-02-14 05:54:08', '2026-02-14 05:53:53'),
(25, 7, '909805', 1, '2026-02-16 21:01:10', '2026-02-16 21:00:47'),
(26, 7, '843596', 1, '2026-02-16 21:15:43', '2026-02-16 21:15:32');

-- --------------------------------------------------------

--
-- Stand-in structure for view `visitor_analytics_summary`
-- (See below for the actual view)
--
CREATE TABLE `visitor_analytics_summary` (
`marina_id` int(10) unsigned
,`marina_name` varchar(255)
,`visit_date` date
,`total_visitors` bigint(21)
,`logged_in_visitors` bigint(21)
,`anonymous_visitors` bigint(21)
,`checkout_started` bigint(21)
,`bookings_completed` bigint(21)
,`checkouts_abandoned` bigint(21)
,`conversion_rate` decimal(26,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `visitor_checkout_events`
--

CREATE TABLE `visitor_checkout_events` (
  `id` int(10) UNSIGNED NOT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `marina_id` int(10) UNSIGNED NOT NULL,
  `slip_id` int(10) UNSIGNED DEFAULT NULL,
  `event_type` enum('checkout_started','boat_selected','details_entered','payment_viewed','payment_attempted','booking_completed','checkout_abandoned') COLLATE utf8mb4_unicode_ci NOT NULL,
  `checkout_step` tinyint(1) DEFAULT NULL COMMENT '1=boat, 2=details, 3=payment, 4=confirmation',
  `check_in_date` date DEFAULT NULL,
  `check_out_date` date DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `abandonment_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Why user left (if tracked)',
  `booking_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'Set if booking completed',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks checkout funnel progress and abandonment';

-- --------------------------------------------------------

--
-- Table structure for table `visitor_interactions`
--

CREATE TABLE `visitor_interactions` (
  `id` int(10) UNSIGNED NOT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marina_id` int(10) UNSIGNED DEFAULT NULL,
  `interaction_type` enum('search','filter_applied','map_interaction','slip_clicked','amenity_viewed','photo_viewed','review_read','contact_clicked','share_clicked') COLLATE utf8mb4_unicode_ci NOT NULL,
  `interaction_data` json DEFAULT NULL COMMENT 'Additional context data',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks user engagement and interactions';

-- --------------------------------------------------------

--
-- Table structure for table `visitor_page_views`
--

CREATE TABLE `visitor_page_views` (
  `id` int(10) UNSIGNED NOT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marina_id` int(10) UNSIGNED DEFAULT NULL,
  `page_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_type` enum('home','marina_list','marina_detail','checkout','profile','other') COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `time_spent_seconds` int(10) UNSIGNED DEFAULT '0',
  `viewed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks individual page views within sessions';

-- --------------------------------------------------------

--
-- Table structure for table `visitor_sessions`
--

CREATE TABLE `visitor_sessions` (
  `id` int(10) UNSIGNED NOT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'NULL if guest, set if logged in',
  `marina_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'Marina being viewed',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `referrer` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landing_page` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` enum('desktop','mobile','tablet') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks all visitor sessions to marina pages';

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_booking_pre_checkout_status`
-- (See below for the actual view)
--
CREATE TABLE `v_booking_pre_checkout_status` (
`booking_id` int(10) unsigned
,`user_id` int(10) unsigned
,`marina_id` int(10) unsigned
,`booking_status` enum('pending','confirmed','cancelled','completed','pending_approval')
,`pre_checkout_completed` tinyint(1)
,`total_required_steps` bigint(21)
,`completed_steps` bigint(21)
,`all_steps_completed` int(1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_cancellation_requests_detailed`
-- (See below for the actual view)
--
CREATE TABLE `v_cancellation_requests_detailed` (
`request_id` int(10) unsigned
,`booking_id` int(10) unsigned
,`request_status` enum('pending','approved','rejected')
,`reason` text
,`admin_notes` text
,`refund_amount` decimal(10,2)
,`refund_percentage` decimal(5,2)
,`requested_at` timestamp
,`responded_at` timestamp
,`responded_by` int(10) unsigned
,`check_in_date` date
,`check_out_date` date
,`total_amount` decimal(10,2)
,`booking_status` enum('pending','confirmed','cancelled','completed','pending_approval')
,`marina_id` int(10) unsigned
,`marina_name` varchar(255)
,`marina_slug` varchar(255)
,`marina_city` varchar(255)
,`marina_state` varchar(255)
,`user_id` int(10) unsigned
,`user_name` varchar(255)
,`user_email` varchar(255)
,`user_phone` varchar(20)
,`responder_name` varchar(255)
,`slip_number` varchar(50)
,`boat_name` varchar(255)
,`boat_length` decimal(8,2)
,`days_until_checkin` int(7)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_host_pre_checkout_overview`
-- (See below for the actual view)
--
CREATE TABLE `v_host_pre_checkout_overview` (
`marina_id` int(10) unsigned
,`marina_name` varchar(255)
,`host_id` int(10) unsigned
,`step_id` int(10) unsigned
,`step_title` varchar(255)
,`step_order` int(10) unsigned
,`total_submissions` bigint(21)
,`completed_submissions` bigint(21)
,`unique_bookings` bigint(21)
,`last_submission_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_slip_availability`
-- (See below for the actual view)
--
CREATE TABLE `v_slip_availability` (
`slip_id` int(10) unsigned
,`marina_id` int(10) unsigned
,`slip_number` varchar(50)
,`slip_active` tinyint(1)
,`price_per_day` decimal(10,2)
,`active_bookings_count` bigint(21)
,`currently_booked` decimal(23,0)
,`blocked_dates_count` bigint(21)
,`blocked_today` decimal(23,0)
,`availability_status` varchar(9)
);

-- --------------------------------------------------------

--
-- Structure for view `home_visitor_stats`
--
DROP TABLE IF EXISTS `home_visitor_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `home_visitor_stats`  AS SELECT cast(`home_visitors`.`visited_at` as date) AS `visit_date`, count(0) AS `total_visits`, count(distinct `home_visitors`.`session_id`) AS `unique_visitors`, sum((case when (`home_visitors`.`device_type` = 'desktop') then 1 else 0 end)) AS `desktop_visits`, sum((case when (`home_visitors`.`device_type` = 'mobile') then 1 else 0 end)) AS `mobile_visits`, sum((case when (`home_visitors`.`device_type` = 'tablet') then 1 else 0 end)) AS `tablet_visits`, count(distinct `home_visitors`.`country_code`) AS `countries_count`, count(distinct (case when ((`home_visitors`.`referrer` is not null) and (`home_visitors`.`referrer` <> '')) then `home_visitors`.`referrer` end)) AS `referrer_count` FROM `home_visitors` GROUP BY cast(`home_visitors`.`visited_at` as date) ORDER BY `visit_date` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `visitor_analytics_summary`
--
DROP TABLE IF EXISTS `visitor_analytics_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `visitor_analytics_summary`  AS SELECT `m`.`id` AS `marina_id`, `m`.`name` AS `marina_name`, cast(`vs`.`started_at` as date) AS `visit_date`, count(distinct `vs`.`session_id`) AS `total_visitors`, count(distinct (case when (`vs`.`user_id` is not null) then `vs`.`session_id` end)) AS `logged_in_visitors`, count(distinct (case when isnull(`vs`.`user_id`) then `vs`.`session_id` end)) AS `anonymous_visitors`, count(distinct (case when (`ce`.`event_type` = 'checkout_started') then `ce`.`session_id` end)) AS `checkout_started`, count(distinct (case when (`ce`.`event_type` = 'booking_completed') then `ce`.`session_id` end)) AS `bookings_completed`, count(distinct (case when (`ce`.`event_type` = 'checkout_abandoned') then `ce`.`session_id` end)) AS `checkouts_abandoned`, round(((count(distinct (case when (`ce`.`event_type` = 'booking_completed') then `ce`.`session_id` end)) * 100.0) / nullif(count(distinct (case when (`ce`.`event_type` = 'checkout_started') then `ce`.`session_id` end)),0)),2) AS `conversion_rate` FROM ((`marinas` `m` left join `visitor_sessions` `vs` on((`m`.`id` = `vs`.`marina_id`))) left join `visitor_checkout_events` `ce` on(((`vs`.`session_id` = `ce`.`session_id`) and (`m`.`id` = `ce`.`marina_id`)))) GROUP BY `m`.`id`, `m`.`name`, cast(`vs`.`started_at` as date) ;

-- --------------------------------------------------------

--
-- Structure for view `v_booking_pre_checkout_status`
--
DROP TABLE IF EXISTS `v_booking_pre_checkout_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_booking_pre_checkout_status`  AS SELECT `b`.`id` AS `booking_id`, `b`.`user_id` AS `user_id`, `b`.`marina_id` AS `marina_id`, `b`.`status` AS `booking_status`, `b`.`pre_checkout_completed` AS `pre_checkout_completed`, count(distinct `mpcs`.`id`) AS `total_required_steps`, count(distinct (case when (`gss`.`is_completed` = 1) then `gss`.`step_id` end)) AS `completed_steps`, (case when (count(distinct `mpcs`.`id`) = 0) then TRUE when (count(distinct `mpcs`.`id`) = count(distinct (case when (`gss`.`is_completed` = 1) then `gss`.`step_id` end))) then TRUE else FALSE end) AS `all_steps_completed` FROM ((`bookings` `b` left join `marina_pre_checkout_steps` `mpcs` on(((`b`.`marina_id` = `mpcs`.`marina_id`) and (`mpcs`.`is_active` = 1) and (`mpcs`.`is_required` = 1)))) left join `guest_step_submissions` `gss` on(((`b`.`id` = `gss`.`booking_id`) and (`mpcs`.`id` = `gss`.`step_id`)))) GROUP BY `b`.`id`, `b`.`user_id`, `b`.`marina_id`, `b`.`status`, `b`.`pre_checkout_completed` ;

-- --------------------------------------------------------

--
-- Structure for view `v_cancellation_requests_detailed`
--
DROP TABLE IF EXISTS `v_cancellation_requests_detailed`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_cancellation_requests_detailed`  AS SELECT `cr`.`id` AS `request_id`, `cr`.`booking_id` AS `booking_id`, `cr`.`status` AS `request_status`, `cr`.`reason` AS `reason`, `cr`.`admin_notes` AS `admin_notes`, `cr`.`refund_amount` AS `refund_amount`, `cr`.`refund_percentage` AS `refund_percentage`, `cr`.`requested_at` AS `requested_at`, `cr`.`responded_at` AS `responded_at`, `cr`.`responded_by` AS `responded_by`, `b`.`check_in_date` AS `check_in_date`, `b`.`check_out_date` AS `check_out_date`, `b`.`total_amount` AS `total_amount`, `b`.`status` AS `booking_status`, `m`.`id` AS `marina_id`, `m`.`name` AS `marina_name`, `m`.`slug` AS `marina_slug`, `m`.`city` AS `marina_city`, `m`.`state` AS `marina_state`, `u`.`id` AS `user_id`, `u`.`full_name` AS `user_name`, `u`.`email` AS `user_email`, `u`.`phone` AS `user_phone`, `responder`.`full_name` AS `responder_name`, `s`.`slip_number` AS `slip_number`, `boat`.`name` AS `boat_name`, `boat`.`length_meters` AS `boat_length`, (to_days(`b`.`check_in_date`) - to_days(curdate())) AS `days_until_checkin` FROM ((((((`cancellation_requests` `cr` join `bookings` `b` on((`cr`.`booking_id` = `b`.`id`))) join `marinas` `m` on((`b`.`marina_id` = `m`.`id`))) join `users` `u` on((`cr`.`user_id` = `u`.`id`))) left join `users` `responder` on((`cr`.`responded_by` = `responder`.`id`))) left join `slips` `s` on((`b`.`slip_id` = `s`.`id`))) left join `boats` `boat` on((`b`.`boat_id` = `boat`.`id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `v_host_pre_checkout_overview`
--
DROP TABLE IF EXISTS `v_host_pre_checkout_overview`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_host_pre_checkout_overview`  AS SELECT `m`.`id` AS `marina_id`, `m`.`name` AS `marina_name`, `m`.`host_id` AS `host_id`, `mpcs`.`id` AS `step_id`, `mpcs`.`title` AS `step_title`, `mpcs`.`step_order` AS `step_order`, count(distinct `gss`.`id`) AS `total_submissions`, count(distinct (case when (`gss`.`is_completed` = 1) then `gss`.`id` end)) AS `completed_submissions`, count(distinct `gss`.`booking_id`) AS `unique_bookings`, max(`gss`.`updated_at`) AS `last_submission_at` FROM ((`marinas` `m` join `marina_pre_checkout_steps` `mpcs` on((`m`.`id` = `mpcs`.`marina_id`))) left join `guest_step_submissions` `gss` on((`mpcs`.`id` = `gss`.`step_id`))) WHERE (`mpcs`.`is_active` = 1) GROUP BY `m`.`id`, `m`.`name`, `m`.`host_id`, `mpcs`.`id`, `mpcs`.`title`, `mpcs`.`step_order` ORDER BY `m`.`id` ASC, `mpcs`.`step_order` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `v_slip_availability`
--
DROP TABLE IF EXISTS `v_slip_availability`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_slip_availability`  AS SELECT `s`.`id` AS `slip_id`, `s`.`marina_id` AS `marina_id`, `s`.`slip_number` AS `slip_number`, `s`.`is_available` AS `slip_active`, `s`.`price_per_day` AS `price_per_day`, count(distinct `b`.`id`) AS `active_bookings_count`, sum((case when ((`b`.`status` in ('confirmed','pending')) and (curdate() between `b`.`check_in_date` and `b`.`check_out_date`)) then 1 else 0 end)) AS `currently_booked`, count(distinct `bd`.`id`) AS `blocked_dates_count`, sum((case when (`bd`.`blocked_date` = curdate()) then 1 else 0 end)) AS `blocked_today`, (case when (`s`.`is_available` = 0) then 'inactive' when (sum((case when (`bd`.`blocked_date` = curdate()) then 1 else 0 end)) > 0) then 'blocked' when (sum((case when ((`b`.`status` in ('confirmed','pending')) and (curdate() between `b`.`check_in_date` and `b`.`check_out_date`)) then 1 else 0 end)) > 0) then 'booked' else 'available' end) AS `availability_status` FROM ((`slips` `s` left join `bookings` `b` on(((`s`.`id` = `b`.`slip_id`) and (`b`.`status` in ('confirmed','pending'))))) left join `blocked_dates` `bd` on(((`bd`.`slip_id` = `s`.`id`) or (isnull(`bd`.`slip_id`) and (`bd`.`marina_id` = `s`.`marina_id`))))) GROUP BY `s`.`id`, `s`.`marina_id`, `s`.`slip_number`, `s`.`is_available`, `s`.`price_per_day` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `amenity_types`
--
ALTER TABLE `amenity_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `anchorages`
--
ALTER TABLE `anchorages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_marina` (`marina_id`),
  ADD KEY `idx_type` (`anchorage_type_id`),
  ADD KEY `idx_location` (`latitude`,`longitude`);

--
-- Indexes for table `anchorage_types`
--
ALTER TABLE `anchorage_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `blocked_dates`
--
ALTER TABLE `blocked_dates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_marina_date` (`marina_id`,`blocked_date`),
  ADD KEY `idx_blocked_dates_slip` (`slip_id`),
  ADD KEY `idx_blocked_dates_date_slip` (`marina_id`,`slip_id`,`blocked_date`);

--
-- Indexes for table `boats`
--
ALTER TABLE `boats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_owner` (`owner_id`),
  ADD KEY `idx_type` (`boat_type_id`);

--
-- Indexes for table `boat_types`
--
ALTER TABLE `boat_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `boat_id` (`boat_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_marina` (`marina_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_dates` (`check_in_date`,`check_out_date`),
  ADD KEY `idx_stripe` (`stripe_payment_intent_id`),
  ADD KEY `idx_bookings_slip` (`slip_id`),
  ADD KEY `idx_bookings_date_slip` (`marina_id`,`slip_id`,`check_in_date`,`check_out_date`),
  ADD KEY `idx_pre_checkout_completed` (`pre_checkout_completed`),
  ADD KEY `idx_requires_approval` (`requires_approval`,`status`);

--
-- Indexes for table `cancellation_requests`
--
ALTER TABLE `cancellation_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_status_requested_at` (`status`,`requested_at`),
  ADD KEY `idx_responded_by` (`responded_by`);

--
-- Indexes for table `content_pages`
--
ALTER TABLE `content_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_marina` (`marina_id`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_validity` (`valid_from`,`valid_until`);

--
-- Indexes for table `faq_categories`
--
ALTER TABLE `faq_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `is_active` (`is_active`),
  ADD KEY `order_index` (`order_index`);

--
-- Indexes for table `faq_questions`
--
ALTER TABLE `faq_questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `is_active` (`is_active`),
  ADD KEY `is_featured` (`is_featured`),
  ADD KEY `order_index` (`order_index`);

--
-- Indexes for table `guest_step_submissions`
--
ALTER TABLE `guest_step_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_booking_step` (`booking_id`,`step_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_step_id` (`step_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_booking_step` (`booking_id`,`step_id`),
  ADD KEY `idx_completed` (`is_completed`),
  ADD KEY `idx_verification_session` (`verification_session_id`);

--
-- Indexes for table `guest_step_uploads`
--
ALTER TABLE `guest_step_uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_submission_id` (`submission_id`),
  ADD KEY `idx_field_id` (`field_id`),
  ADD KEY `idx_submission_field` (`submission_id`,`field_id`);

--
-- Indexes for table `home_visitors`
--
ALTER TABLE `home_visitors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session_id` (`session_id`),
  ADD KEY `idx_visited_at` (`visited_at`),
  ADD KEY `idx_device_type` (`device_type`);

--
-- Indexes for table `hosts`
--
ALTER TABLE `hosts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `is_active` (`is_active`),
  ADD KEY `email_verified` (`email_verified`),
  ADD KEY `idx_marina_id` (`marina_id`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `host_sessions`
--
ALTER TABLE `host_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `host_id` (`host_id`),
  ADD KEY `is_verified` (`is_verified`),
  ADD KEY `expires_at` (`expires_at`);

--
-- Indexes for table `marinas`
--
ALTER TABLE `marinas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `business_type_id` (`business_type_id`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_location` (`latitude`,`longitude`),
  ADD KEY `idx_city` (`city`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_featured` (`is_featured`),
  ADD KEY `host_id` (`host_id`);
ALTER TABLE `marinas` ADD FULLTEXT KEY `idx_search` (`name`,`description`,`city`);

--
-- Indexes for table `marina_amenities`
--
ALTER TABLE `marina_amenities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_marina_amenity` (`marina_id`,`amenity_id`),
  ADD KEY `amenity_id` (`amenity_id`);

--
-- Indexes for table `marina_business_types`
--
ALTER TABLE `marina_business_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `marina_features`
--
ALTER TABLE `marina_features`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_marina_features` (`marina_id`);

--
-- Indexes for table `marina_images`
--
ALTER TABLE `marina_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_marina` (`marina_id`),
  ADD KEY `idx_primary` (`is_primary`);

--
-- Indexes for table `marina_pre_checkout_steps`
--
ALTER TABLE `marina_pre_checkout_steps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_marina_id` (`marina_id`),
  ADD KEY `idx_marina_order` (`marina_id`,`step_order`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `moorings`
--
ALTER TABLE `moorings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_marina_mooring` (`marina_id`,`mooring_number`),
  ADD KEY `idx_marina` (`marina_id`),
  ADD KEY `idx_type` (`mooring_type_id`),
  ADD KEY `idx_available` (`is_available`);

--
-- Indexes for table `mooring_types`
--
ALTER TABLE `mooring_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `points`
--
ALTER TABLE `points`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_marina` (`marina_id`),
  ADD KEY `idx_type` (`point_type_id`),
  ADD KEY `idx_location` (`latitude`,`longitude`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `point_types`
--
ALTER TABLE `point_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `pre_checkout_step_fields`
--
ALTER TABLE `pre_checkout_step_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_step_id` (`step_id`),
  ADD KEY `idx_step_order` (`step_id`,`field_order`);

--
-- Indexes for table `pre_checkout_temp_uploads`
--
ALTER TABLE `pre_checkout_temp_uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_marina` (`user_id`,`marina_id`),
  ADD KEY `idx_step_field` (`step_id`,`field_id`),
  ADD KEY `pre_checkout_temp_uploads_ibfk_2` (`marina_id`),
  ADD KEY `pre_checkout_temp_uploads_ibfk_4` (`field_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_review_category` (`review_id`,`rating_category_id`),
  ADD KEY `idx_review` (`review_id`),
  ADD KEY `idx_category` (`rating_category_id`);

--
-- Indexes for table `rating_categories`
--
ALTER TABLE `rating_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_marina` (`marina_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_approved` (`is_approved`);

--
-- Indexes for table `seabeds`
--
ALTER TABLE `seabeds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_marina` (`marina_id`),
  ADD KEY `idx_anchorage` (`anchorage_id`),
  ADD KEY `idx_type` (`seabed_type_id`);

--
-- Indexes for table `seabed_types`
--
ALTER TABLE `seabed_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`);

--
-- Indexes for table `slips`
--
ALTER TABLE `slips`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_marina_slip` (`marina_id`,`slip_number`),
  ADD KEY `idx_marina` (`marina_id`),
  ADD KEY `idx_available` (`is_available`),
  ADD KEY `idx_size` (`length_meters`,`width_meters`);

--
-- Indexes for table `stripe_identity_verifications`
--
ALTER TABLE `stripe_identity_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id` (`session_id`),
  ADD UNIQUE KEY `user_step_unique` (`user_id`,`step_id`,`marina_id`),
  ADD KEY `idx_session_id` (`session_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `step_id` (`step_id`),
  ADD KEY `marina_id` (`marina_id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_number` (`ticket_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status` (`status`),
  ADD KEY `priority` (`priority`),
  ADD KEY `category` (`category`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `support_ticket_attachments`
--
ALTER TABLE `support_ticket_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `message_id` (`message_id`);

--
-- Indexes for table `support_ticket_messages`
--
ALTER TABLE `support_ticket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `sender_type` (`sender_type`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_stripe_customer` (`stripe_customer_id`),
  ADD KEY `idx_user_type` (`user_type`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_code` (`user_id`,`verification_code`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `visitor_checkout_events`
--
ALTER TABLE `visitor_checkout_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id_idx` (`session_id`),
  ADD KEY `user_id_idx` (`user_id`),
  ADD KEY `marina_id_idx` (`marina_id`),
  ADD KEY `event_type_idx` (`event_type`),
  ADD KEY `created_at_idx` (`created_at`),
  ADD KEY `booking_id_idx` (`booking_id`),
  ADD KEY `fk_checkout_events_slip` (`slip_id`),
  ADD KEY `idx_checkout_marina_event` (`marina_id`,`event_type`,`created_at`);

--
-- Indexes for table `visitor_interactions`
--
ALTER TABLE `visitor_interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id_idx` (`session_id`),
  ADD KEY `marina_id_idx` (`marina_id`),
  ADD KEY `interaction_type_idx` (`interaction_type`),
  ADD KEY `created_at_idx` (`created_at`);

--
-- Indexes for table `visitor_page_views`
--
ALTER TABLE `visitor_page_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id_idx` (`session_id`),
  ADD KEY `marina_id_idx` (`marina_id`),
  ADD KEY `page_type_idx` (`page_type`),
  ADD KEY `viewed_at_idx` (`viewed_at`),
  ADD KEY `idx_pageviews_marina_type` (`marina_id`,`page_type`,`viewed_at`);

--
-- Indexes for table `visitor_sessions`
--
ALTER TABLE `visitor_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id_unique` (`session_id`),
  ADD KEY `user_id_idx` (`user_id`),
  ADD KEY `marina_id_idx` (`marina_id`),
  ADD KEY `started_at_idx` (`started_at`),
  ADD KEY `last_activity_at_idx` (`last_activity_at`),
  ADD KEY `idx_sessions_marina_date` (`marina_id`,`started_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `amenity_types`
--
ALTER TABLE `amenity_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `anchorages`
--
ALTER TABLE `anchorages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `anchorage_types`
--
ALTER TABLE `anchorage_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `blocked_dates`
--
ALTER TABLE `blocked_dates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `boats`
--
ALTER TABLE `boats`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `boat_types`
--
ALTER TABLE `boat_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `cancellation_requests`
--
ALTER TABLE `cancellation_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `content_pages`
--
ALTER TABLE `content_pages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `faq_categories`
--
ALTER TABLE `faq_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `faq_questions`
--
ALTER TABLE `faq_questions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `guest_step_submissions`
--
ALTER TABLE `guest_step_submissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guest_step_uploads`
--
ALTER TABLE `guest_step_uploads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `home_visitors`
--
ALTER TABLE `home_visitors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `hosts`
--
ALTER TABLE `hosts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `host_sessions`
--
ALTER TABLE `host_sessions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `marinas`
--
ALTER TABLE `marinas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `marina_amenities`
--
ALTER TABLE `marina_amenities`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=177;

--
-- AUTO_INCREMENT for table `marina_business_types`
--
ALTER TABLE `marina_business_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `marina_features`
--
ALTER TABLE `marina_features`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `marina_images`
--
ALTER TABLE `marina_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `marina_pre_checkout_steps`
--
ALTER TABLE `marina_pre_checkout_steps`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `moorings`
--
ALTER TABLE `moorings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `mooring_types`
--
ALTER TABLE `mooring_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `points`
--
ALTER TABLE `points`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `point_types`
--
ALTER TABLE `point_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pre_checkout_step_fields`
--
ALTER TABLE `pre_checkout_step_fields`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `pre_checkout_temp_uploads`
--
ALTER TABLE `pre_checkout_temp_uploads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `rating_categories`
--
ALTER TABLE `rating_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seabeds`
--
ALTER TABLE `seabeds`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `seabed_types`
--
ALTER TABLE `seabed_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `slips`
--
ALTER TABLE `slips`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `stripe_identity_verifications`
--
ALTER TABLE `stripe_identity_verifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_ticket_attachments`
--
ALTER TABLE `support_ticket_attachments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_ticket_messages`
--
ALTER TABLE `support_ticket_messages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `visitor_checkout_events`
--
ALTER TABLE `visitor_checkout_events`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visitor_interactions`
--
ALTER TABLE `visitor_interactions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visitor_page_views`
--
ALTER TABLE `visitor_page_views`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visitor_sessions`
--
ALTER TABLE `visitor_sessions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `anchorages`
--
ALTER TABLE `anchorages`
  ADD CONSTRAINT `anchorages_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `anchorages_ibfk_2` FOREIGN KEY (`anchorage_type_id`) REFERENCES `anchorage_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blocked_dates`
--
ALTER TABLE `blocked_dates`
  ADD CONSTRAINT `blocked_dates_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blocked_dates_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blocked_dates_ibfk_3` FOREIGN KEY (`slip_id`) REFERENCES `slips` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `boats`
--
ALTER TABLE `boats`
  ADD CONSTRAINT `boats_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `boats_ibfk_2` FOREIGN KEY (`boat_type_id`) REFERENCES `boat_types` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`boat_id`) REFERENCES `boats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`slip_id`) REFERENCES `slips` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cancellation_requests`
--
ALTER TABLE `cancellation_requests`
  ADD CONSTRAINT `fk_cancellation_requests_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cancellation_requests_responder` FOREIGN KEY (`responded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cancellation_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupons`
--
ALTER TABLE `coupons`
  ADD CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faq_questions`
--
ALTER TABLE `faq_questions`
  ADD CONSTRAINT `faq_questions_category_fk` FOREIGN KEY (`category_id`) REFERENCES `faq_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guest_step_submissions`
--
ALTER TABLE `guest_step_submissions`
  ADD CONSTRAINT `guest_step_submissions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guest_step_submissions_ibfk_2` FOREIGN KEY (`step_id`) REFERENCES `marina_pre_checkout_steps` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guest_step_submissions_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guest_step_uploads`
--
ALTER TABLE `guest_step_uploads`
  ADD CONSTRAINT `guest_step_uploads_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `guest_step_submissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guest_step_uploads_ibfk_2` FOREIGN KEY (`field_id`) REFERENCES `pre_checkout_step_fields` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hosts`
--
ALTER TABLE `hosts`
  ADD CONSTRAINT `hosts_ibfk_marina` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `host_sessions`
--
ALTER TABLE `host_sessions`
  ADD CONSTRAINT `host_sessions_ibfk_1` FOREIGN KEY (`host_id`) REFERENCES `hosts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `marinas`
--
ALTER TABLE `marinas`
  ADD CONSTRAINT `marinas_ibfk_2` FOREIGN KEY (`business_type_id`) REFERENCES `marina_business_types` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `marinas_ibfk_host` FOREIGN KEY (`host_id`) REFERENCES `hosts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `marina_amenities`
--
ALTER TABLE `marina_amenities`
  ADD CONSTRAINT `marina_amenities_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `marina_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenity_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `marina_features`
--
ALTER TABLE `marina_features`
  ADD CONSTRAINT `marina_features_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `marina_images`
--
ALTER TABLE `marina_images`
  ADD CONSTRAINT `marina_images_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `marina_pre_checkout_steps`
--
ALTER TABLE `marina_pre_checkout_steps`
  ADD CONSTRAINT `marina_pre_checkout_steps_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `moorings`
--
ALTER TABLE `moorings`
  ADD CONSTRAINT `moorings_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `moorings_ibfk_2` FOREIGN KEY (`mooring_type_id`) REFERENCES `mooring_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `points`
--
ALTER TABLE `points`
  ADD CONSTRAINT `points_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `points_ibfk_2` FOREIGN KEY (`point_type_id`) REFERENCES `point_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pre_checkout_step_fields`
--
ALTER TABLE `pre_checkout_step_fields`
  ADD CONSTRAINT `pre_checkout_step_fields_ibfk_1` FOREIGN KEY (`step_id`) REFERENCES `marina_pre_checkout_steps` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pre_checkout_temp_uploads`
--
ALTER TABLE `pre_checkout_temp_uploads`
  ADD CONSTRAINT `pre_checkout_temp_uploads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pre_checkout_temp_uploads_ibfk_2` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pre_checkout_temp_uploads_ibfk_3` FOREIGN KEY (`step_id`) REFERENCES `marina_pre_checkout_steps` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pre_checkout_temp_uploads_ibfk_4` FOREIGN KEY (`field_id`) REFERENCES `pre_checkout_step_fields` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`rating_category_id`) REFERENCES `rating_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seabeds`
--
ALTER TABLE `seabeds`
  ADD CONSTRAINT `seabeds_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `seabeds_ibfk_2` FOREIGN KEY (`anchorage_id`) REFERENCES `anchorages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `seabeds_ibfk_3` FOREIGN KEY (`seabed_type_id`) REFERENCES `seabed_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `slips`
--
ALTER TABLE `slips`
  ADD CONSTRAINT `slips_ibfk_1` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stripe_identity_verifications`
--
ALTER TABLE `stripe_identity_verifications`
  ADD CONSTRAINT `stripe_identity_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stripe_identity_verifications_ibfk_2` FOREIGN KEY (`step_id`) REFERENCES `marina_pre_checkout_steps` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stripe_identity_verifications_ibfk_3` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_booking_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `support_tickets_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `support_ticket_attachments`
--
ALTER TABLE `support_ticket_attachments`
  ADD CONSTRAINT `support_ticket_attachments_message_fk` FOREIGN KEY (`message_id`) REFERENCES `support_ticket_messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `support_ticket_attachments_ticket_fk` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_ticket_messages`
--
ALTER TABLE `support_ticket_messages`
  ADD CONSTRAINT `support_ticket_messages_ticket_fk` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `visitor_checkout_events`
--
ALTER TABLE `visitor_checkout_events`
  ADD CONSTRAINT `fk_checkout_events_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_checkout_events_marina` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_checkout_events_session` FOREIGN KEY (`session_id`) REFERENCES `visitor_sessions` (`session_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_checkout_events_slip` FOREIGN KEY (`slip_id`) REFERENCES `slips` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_checkout_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `visitor_interactions`
--
ALTER TABLE `visitor_interactions`
  ADD CONSTRAINT `fk_interactions_marina` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_interactions_session` FOREIGN KEY (`session_id`) REFERENCES `visitor_sessions` (`session_id`) ON DELETE CASCADE;

--
-- Constraints for table `visitor_page_views`
--
ALTER TABLE `visitor_page_views`
  ADD CONSTRAINT `fk_page_views_marina` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_page_views_session` FOREIGN KEY (`session_id`) REFERENCES `visitor_sessions` (`session_id`) ON DELETE CASCADE;

--
-- Constraints for table `visitor_sessions`
--
ALTER TABLE `visitor_sessions`
  ADD CONSTRAINT `fk_visitor_sessions_marina` FOREIGN KEY (`marina_id`) REFERENCES `marinas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_visitor_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
