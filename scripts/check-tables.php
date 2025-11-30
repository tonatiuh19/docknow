<?php
// Quick script to check what tables exist in the database

$host = 'mx50.hostgator.mx';
$port = 3306;
$dbname = 'alanchat_docknow';
$user = 'alanchat_docknow_admin';
$password = 'dockNow2025$';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔍 DockNow Database Table Check\n";
    echo "================================\n\n";
    
    // Get all tables
    $stmt = $pdo->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "📊 Current Tables in Database: " . count($existingTables) . "\n";
    echo "-----------------------------------\n";
    foreach ($existingTables as $table) {
        echo "  ✓ $table\n";
    }
    
    echo "\n";
    
    // Tables that should exist from base schema
    $baseTables = [
        'users', 'user_sessions', 'boats', 'boat_types', 
        'marinas', 'marina_business_types', 'marina_images', 
        'marina_amenities', 'amenity_types', 'bookings', 
        'blocked_dates', 'coupons', 'reviews', 'settings', 'content_pages'
    ];
    
    // Tables from extended schema
    $extendedTables = [
        'slips', 'anchorage_types', 'anchorages', 
        'mooring_types', 'moorings', 'seabed_types', 'seabeds',
        'point_types', 'points', 'rating_categories', 'ratings',
        'marina_features'
    ];
    
    echo "✅ BASE SCHEMA STATUS:\n";
    echo "=====================\n";
    $baseMissing = [];
    foreach ($baseTables as $table) {
        if (in_array($table, $existingTables)) {
            echo "  ✓ $table\n";
        } else {
            echo "  ✗ $table - MISSING\n";
            $baseMissing[] = $table;
        }
    }
    
    echo "\n🆕 EXTENDED SCHEMA STATUS:\n";
    echo "=========================\n";
    $extendedMissing = [];
    foreach ($extendedTables as $table) {
        if (in_array($table, $existingTables)) {
            echo "  ✓ $table - EXISTS\n";
        } else {
            echo "  ✗ $table - MISSING\n";
            $extendedMissing[] = $table;
        }
    }
    
    echo "\n📈 SUMMARY:\n";
    echo "===========\n";
    echo "  Base tables missing: " . count($baseMissing) . "\n";
    echo "  Extended tables missing: " . count($extendedMissing) . "\n";
    
    if (count($baseMissing) > 0) {
        echo "\n⚠️  Run: database/schema.sql\n";
    }
    if (count($extendedMissing) > 0) {
        echo "⚠️  Run: database/schema-extended.sql\n";
    }
    if (count($baseMissing) === 0 && count($extendedMissing) === 0) {
        echo "\n✅ All tables exist! Database is complete.\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "\n";
}
