#!/bin/bash

# DockNow - Database Table Verification Script
# This script checks which tables exist and which need to be created

echo "🔍 DockNow Database Table Verification"
echo "======================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found!"
    exit 1
fi

echo "Connecting to database: $DB_NAME at $DB_HOST"
echo ""

# Check if mysql client is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL client is not installed"
    echo "   Install it with: brew install mysql-client"
    exit 1
fi

echo "📊 Checking existing tables..."
echo ""

# Get all tables
TABLES=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SHOW TABLES;")

# Base schema tables (should exist)
BASE_TABLES=(
    "users"
    "user_sessions"
    "boats"
    "boat_types"
    "marinas"
    "marina_business_types"
    "marina_images"
    "marina_amenities"
    "amenity_types"
    "bookings"
    "blocked_dates"
    "coupons"
    "reviews"
    "settings"
    "content_pages"
)

# Extended schema tables (new)
EXTENDED_TABLES=(
    "slips"
    "anchorage_types"
    "anchorages"
    "mooring_types"
    "moorings"
    "seabed_types"
    "seabeds"
    "point_types"
    "points"
    "rating_categories"
    "ratings"
    "marina_features"
)

echo "✅ BASE SCHEMA TABLES:"
echo "====================="
for table in "${BASE_TABLES[@]}"; do
    if echo "$TABLES" | grep -q "^$table$"; then
        echo "  ✓ $table - EXISTS"
    else
        echo "  ✗ $table - MISSING (run schema.sql)"
    fi
done

echo ""
echo "🆕 EXTENDED SCHEMA TABLES:"
echo "========================="
MISSING_COUNT=0
for table in "${EXTENDED_TABLES[@]}"; do
    if echo "$TABLES" | grep -q "^$table$"; then
        echo "  ✓ $table - EXISTS"
    else
        echo "  ✗ $table - MISSING (run schema-extended.sql)"
        ((MISSING_COUNT++))
    fi
done

echo ""
echo "📈 SUMMARY:"
echo "==========="
TOTAL_TABLES=$(echo "$TABLES" | wc -l | tr -d ' ')
echo "  Total tables in database: $TOTAL_TABLES"
echo "  Extended tables missing: $MISSING_COUNT"

echo ""

if [ $MISSING_COUNT -gt 0 ]; then
    echo "⚠️  You need to run the extended schema:"
    echo "   mysql -h\"$DB_HOST\" -P\"$DB_PORT\" -u\"$DB_USER\" -p\"$DB_PASSWORD\" \"$DB_NAME\" < database/schema-extended.sql"
    echo ""
    echo "   Then run the extended seed data:"
    echo "   mysql -h\"$DB_HOST\" -P\"$DB_PORT\" -u\"$DB_USER\" -p\"$DB_PASSWORD\" \"$DB_NAME\" < database/seed-extended.sql"
else
    echo "✅ All tables exist! Database is ready."
fi

echo ""
