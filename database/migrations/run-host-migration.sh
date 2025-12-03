#!/bin/bash

# Host CRM Database Migration Script
# Run this to set up the hosts tables and migrate existing data

echo "🚀 DockNow Host CRM - Database Migration"
echo "========================================"
echo ""

# Check if mysql command exists
if ! command -v mysql &> /dev/null; then
    echo "❌ Error: mysql command not found"
    echo "Please install MySQL client first"
    exit 1
fi

# Prompt for database credentials
read -p "Enter MySQL username: " DB_USER
read -sp "Enter MySQL password: " DB_PASS
echo ""
read -p "Enter database name: " DB_NAME

echo ""
echo "📊 Running migration..."
echo ""

# Run the migration
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < database/migrations/002_create_hosts_tables.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Summary:"
    echo "   - Created 'hosts' table"
    echo "   - Created 'host_sessions' table"
    echo "   - Added 'host_id' to marinas table"
    echo "   - Migrated existing marina owners to hosts table"
    echo ""
    echo "🎉 Your Host CRM system is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Run 'npm run dev' to start the development server"
    echo "2. Navigate to http://localhost:3000/host/login"
    echo "3. Login with a host account"
    echo ""
    echo "📧 Default test host: host@docknow.com"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error messages above"
    exit 1
fi
