#!/bin/bash

# DockNow - Database Setup Script
# This script will set up the database schema and insert mock marina data

echo "🚤 DockNow Database Setup"
echo "========================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Loaded environment variables from .env"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if mysql client is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL client is not installed"
    echo "   Install it with: brew install mysql-client"
    exit 1
fi

echo ""
echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Prompt for confirmation
read -p "Continue with database setup? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "Step 1: Creating database schema..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/schema.sql

if [ $? -eq 0 ]; then
    echo "✓ Schema created successfully"
else
    echo "❌ Schema creation failed"
    exit 1
fi

echo ""
echo "Step 2: Inserting mock marina data..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/seed-marinas.sql

if [ $? -eq 0 ]; then
    echo "✓ Mock data inserted successfully"
else
    echo "❌ Mock data insertion failed"
    exit 1
fi

echo ""
echo "Step 3: Verifying data..."
MARINA_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM marinas;")
IMAGE_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM marina_images;")
AMENITY_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM marina_amenities;")

echo ""
echo "Database Setup Complete! 🎉"
echo "=========================="
echo "  Marinas: $MARINA_COUNT"
echo "  Images: $IMAGE_COUNT"
echo "  Amenity Associations: $AMENITY_COUNT"
echo ""
echo "Next steps:"
echo "  1. Run: npm run dev"
echo "  2. Visit: http://localhost:3000"
echo "  3. Search for marinas!"
echo ""
