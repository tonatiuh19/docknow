#!/bin/bash

# DockNow Slip Control Migration Script
# This script helps run the database migration safely

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Configuration
DB_NAME="${DB_NAME:-alanchat_docknow}"
DB_USER="${DB_USER:-root}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"

# Migration files
MIGRATION_FILE="$SCRIPT_DIR/001_add_slip_control.sql"
ROLLBACK_FILE="$SCRIPT_DIR/001_add_slip_control_rollback.sql"
BACKUP_DIR="$SCRIPT_DIR/backups"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  DockNow Slip Control Migration${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if MySQL is installed
check_mysql() {
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL client not found. Please install MySQL."
        exit 1
    fi
    print_success "MySQL client found"
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_success "Created backup directory: $BACKUP_DIR"
    fi
}

# Backup database
backup_database() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${DB_NAME}_${timestamp}.sql"
    
    print_info "Creating database backup..."
    
    if mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" > "$backup_file" 2>/dev/null; then
        print_success "Backup created: $backup_file"
        
        # Compress backup
        gzip "$backup_file"
        print_success "Backup compressed: ${backup_file}.gz"
    else
        print_error "Backup failed"
        exit 1
    fi
}

# Test database connection
test_connection() {
    print_info "Testing database connection..."
    
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -e "USE $DB_NAME" 2>/dev/null; then
        print_success "Database connection successful"
        return 0
    else
        print_error "Cannot connect to database"
        exit 1
    fi
}

# Run migration
run_migration() {
    print_info "Running migration..."
    
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < "$MIGRATION_FILE"; then
        print_success "Migration completed successfully!"
        return 0
    else
        print_error "Migration failed"
        return 1
    fi
}

# Run rollback
run_rollback() {
    print_warning "Running rollback..."
    
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < "$ROLLBACK_FILE"; then
        print_success "Rollback completed successfully!"
        return 0
    else
        print_error "Rollback failed"
        return 1
    fi
}

# Verify migration
verify_migration() {
    print_info "Verifying migration..."
    
    local query="
    SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = '$DB_NAME' 
    AND TABLE_NAME IN ('bookings', 'blocked_dates') 
    AND COLUMN_NAME = 'slip_id';"
    
    local result=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -N -B -e "$query" "$DB_NAME" 2>/dev/null)
    
    if [ "$result" == "2" ]; then
        print_success "Migration verified: slip_id columns added"
        
        # Check procedures
        local proc_count=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -N -B -e "SHOW PROCEDURE STATUS WHERE Db='$DB_NAME' AND Name LIKE 'sp_%slip%';" "$DB_NAME" 2>/dev/null | wc -l)
        print_success "Stored procedures created: $proc_count"
        
        # Check view
        local view_count=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -N -B -e "SHOW FULL TABLES WHERE Table_type = 'VIEW' AND Tables_in_$DB_NAME = 'v_slip_availability';" "$DB_NAME" 2>/dev/null | wc -l)
        print_success "View created: v_slip_availability"
        
        return 0
    else
        print_error "Migration verification failed"
        return 1
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  migrate   - Run the migration (default)"
    echo "  rollback  - Rollback the migration"
    echo "  verify    - Verify migration status"
    echo "  backup    - Create database backup only"
    echo "  help      - Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DB_NAME   - Database name (default: alanchat_docknow)"
    echo "  DB_USER   - Database user (default: root)"
    echo "  DB_HOST   - Database host (default: localhost)"
    echo "  DB_PORT   - Database port (default: 3306)"
    echo ""
    echo "Example:"
    echo "  DB_NAME=mydb DB_USER=admin $0 migrate"
}

# Main script
main() {
    print_header
    
    local command="${1:-migrate}"
    
    case "$command" in
        migrate)
            check_mysql
            test_connection
            create_backup_dir
            
            echo ""
            print_warning "This will modify the database schema."
            read -p "Do you want to create a backup first? (Y/n): " -n 1 -r
            echo ""
            
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                backup_database
            fi
            
            echo ""
            read -p "Proceed with migration? (y/N): " -n 1 -r
            echo ""
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                run_migration
                verify_migration
                
                echo ""
                print_success "Migration completed!"
                print_info "Check the migration log above for any warnings."
            else
                print_warning "Migration cancelled"
                exit 0
            fi
            ;;
            
        rollback)
            check_mysql
            test_connection
            create_backup_dir
            
            echo ""
            print_warning "This will rollback database changes."
            read -p "Do you want to create a backup first? (Y/n): " -n 1 -r
            echo ""
            
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                backup_database
            fi
            
            echo ""
            read -p "Proceed with rollback? (y/N): " -n 1 -r
            echo ""
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                run_rollback
                print_success "Rollback completed!"
            else
                print_warning "Rollback cancelled"
                exit 0
            fi
            ;;
            
        verify)
            check_mysql
            test_connection
            verify_migration
            ;;
            
        backup)
            check_mysql
            test_connection
            create_backup_dir
            backup_database
            ;;
            
        help|--help|-h)
            show_usage
            ;;
            
        *)
            print_error "Unknown command: $command"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
