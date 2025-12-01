# Slip-Level Control Migration

## Overview

This migration adds slip-level control to the DockNow database, allowing individual slips to be tracked, booked, and blocked independently. Previously, bookings and blocked dates were only tracked at the marina level.

## Changes Summary

### 1. **Database Schema Changes**

#### `bookings` table

- **Added:** `slip_id` column (INT UNSIGNED, nullable, foreign key to `slips.id`)
- **Purpose:** Links each booking to a specific slip instead of just a marina

#### `blocked_dates` table

- **Added:** `slip_id` column (INT UNSIGNED, nullable, foreign key to `slips.id`)
- **Purpose:** Allows blocking individual slips or entire marinas
- **Deprecated:** `blocked_slips` JSON field (kept for backward compatibility)
- **Deprecated:** `block_all_slips` field (use `slip_id = NULL` for marina-wide blocks)

### 2. **New Database Objects**

#### View: `v_slip_availability`

Provides real-time availability status for each slip, including:

- Active bookings count
- Blocked dates count
- Current availability status (available, booked, blocked, inactive)

#### Stored Procedure: `sp_check_slip_availability`

**Parameters:**

- `p_slip_id` - Slip ID to check
- `p_check_in` - Check-in date
- `p_check_out` - Check-out date

**Returns:** Availability status with conflict details

#### Stored Procedure: `sp_get_available_slips`

**Parameters:**

- `p_marina_id` - Marina ID
- `p_check_in` - Check-in date
- `p_check_out` - Check-out date
- `p_min_length` - Minimum boat length (nullable)
- `p_max_length` - Maximum boat length (nullable)

**Returns:** List of available slips matching criteria

#### Triggers

- `tr_slips_after_insert` - Updates marina slip counts on insert
- `tr_slips_after_update` - Updates marina slip counts on update
- `tr_slips_after_delete` - Updates marina slip counts on delete

### 3. **Indexes Added**

For better query performance:

- `idx_bookings_slip` on `bookings(slip_id)`
- `idx_bookings_date_slip` on `bookings(marina_id, slip_id, check_in_date, check_out_date)`
- `idx_blocked_dates_slip` on `blocked_dates(slip_id)`
- `idx_blocked_dates_date_slip` on `blocked_dates(marina_id, slip_id, blocked_date)`

## Migration Process

### Prerequisites

- MySQL 5.7+ or MariaDB 10.2+
- Database backup completed
- Adequate permissions (CREATE, ALTER, DROP privileges)

### Running the Migration

```bash
# Connect to your database
mysql -u username -p database_name

# Run the migration
source /Users/felixgomez/Code/docknow/database/migrations/001_add_slip_control.sql
```

Or using the script:

```bash
cd /Users/felixgomez/Code/docknow/database/migrations
mysql -u username -p database_name < 001_add_slip_control.sql
```

### Rollback (if needed)

```bash
mysql -u username -p database_name < 001_add_slip_control_rollback.sql
```

## Data Migration Strategy

### Existing Bookings

- All existing bookings will have `slip_id = NULL`
- This maintains backward compatibility (marina-level bookings)
- New bookings should specify a `slip_id`

### Existing Blocked Dates

#### Marina-Wide Blocks

- Existing records with `block_all_slips = 1` continue to work
- `slip_id = NULL` indicates marina-wide blocking
- Example: Holiday closures, marina maintenance

#### Specific Slip Blocks

- Old approach: JSON array in `blocked_slips` field
- New approach: Individual records with `slip_id` specified
- **Migration needed:** Convert JSON entries to individual records (see commented code in migration file)

## Usage Examples

### 1. Create a Booking for a Specific Slip

```sql
INSERT INTO bookings (
    user_id, marina_id, slip_id, boat_id,
    check_in_date, check_out_date, total_days,
    price_per_day, subtotal, service_fee, total_amount, status
) VALUES (
    1, 1, 5, 1,  -- slip_id = 5
    '2025-12-10', '2025-12-15', 5,
    850.00, 4250.00, 425.00, 4675.00, 'confirmed'
);
```

### 2. Block a Specific Slip

```sql
-- Block slip #5 for maintenance
INSERT INTO blocked_dates (
    marina_id, slip_id, blocked_date, reason, created_by
) VALUES (
    1, 5, '2025-12-20', 'Slip maintenance', 1
);
```

### 3. Block Entire Marina

```sql
-- Block all slips (slip_id = NULL)
INSERT INTO blocked_dates (
    marina_id, slip_id, blocked_date, reason, created_by, is_all_day
) VALUES (
    1, NULL, '2025-12-25', 'Christmas closure', 1, 1
);
```

### 4. Check Slip Availability

```sql
-- Check if slip #5 is available from Dec 10-15
CALL sp_check_slip_availability(5, '2025-12-10', '2025-12-15');
```

### 5. Find Available Slips

```sql
-- Find available slips at marina #1 for boats 10-20 meters
CALL sp_get_available_slips(1, '2025-12-10', '2025-12-15', 10.00, 20.00);
```

### 6. View Slip Availability Dashboard

```sql
-- See real-time availability for all slips at marina #1
SELECT
    slip_number,
    availability_status,
    active_bookings_count,
    blocked_dates_count,
    price_per_day
FROM v_slip_availability
WHERE marina_id = 1
ORDER BY slip_number;
```

### 7. Get Available Slips Only

```sql
SELECT *
FROM v_slip_availability
WHERE marina_id = 1
AND availability_status = 'available'
ORDER BY price_per_day ASC;
```

## API Integration Recommendations

### Update Booking Creation Endpoint

```typescript
// Before (marina-level booking)
{
  "marina_id": 1,
  "check_in_date": "2025-12-10",
  "check_out_date": "2025-12-15"
}

// After (slip-level booking)
{
  "marina_id": 1,
  "slip_id": 5,  // NEW: Specific slip
  "check_in_date": "2025-12-10",
  "check_out_date": "2025-12-15"
}
```

### New Endpoint: Get Available Slips

```typescript
GET /api/marinas/:marina_id/available-slips
  ?check_in=2025-12-10
  &check_out=2025-12-15
  &min_length=10
  &max_length=20

Response:
[
  {
    "id": 5,
    "slip_number": "B-202",
    "length_meters": 12.00,
    "price_per_day": 700.00,
    "has_power": true,
    "has_water": true
  },
  ...
]
```

### Update Marina Search to Include Slip Availability

```typescript
GET /api/marinas/search?available_slips=true

// Include slip availability in response
{
  "marina_id": 1,
  "name": "Marina Vallarta",
  "total_slips": 350,
  "available_slips_count": 45,  // From view
  "price_per_day": 850.00
}
```

## Benefits

### 1. **Precise Inventory Management**

- Track which specific slips are booked
- Better capacity planning
- Accurate availability reporting

### 2. **Enhanced User Experience**

- Customers can see exact slip assignments
- Choose preferred slip locations
- View slip-specific amenities

### 3. **Better Revenue Management**

- Price slips individually based on location/features
- Track performance by slip
- Optimize pricing strategies

### 4. **Maintenance Scheduling**

- Block individual slips for maintenance
- Minimize marina downtime
- Better resource allocation

### 5. **Reporting & Analytics**

- Slip-level occupancy rates
- Revenue per slip
- Popular vs. underutilized slips

## Performance Considerations

- **Indexes added:** Ensure queries on slip_id, date ranges remain fast
- **View optimization:** `v_slip_availability` uses LEFT JOINs efficiently
- **Stored procedures:** Reduce round trips for availability checks
- **Triggers:** Automatic slip count updates (minimal overhead)

## Testing Checklist

- [ ] Verify foreign key constraints work correctly
- [ ] Test booking creation with slip_id
- [ ] Test blocking individual slips
- [ ] Test blocking entire marina (slip_id = NULL)
- [ ] Verify availability view returns accurate data
- [ ] Test stored procedure with various date ranges
- [ ] Check trigger updates marina slip counts
- [ ] Verify indexes improve query performance
- [ ] Test with existing bookings (slip_id = NULL)
- [ ] Load test with concurrent bookings

## Future Enhancements

1. **Slip Types/Categories**

   - Premium, standard, economy slips
   - Different pricing tiers

2. **Slip Reservations**

   - Hold slips temporarily during booking process
   - Expire after timeout

3. **Slip Preferences**

   - User favorites
   - Repeat booking same slip

4. **Overbooking Protection**

   - Constraints to prevent double-booking
   - Automated conflict resolution

5. **Dynamic Pricing**
   - Seasonal rates per slip
   - Demand-based pricing

## Support

For issues or questions:

- Check migration logs for errors
- Review constraint violations
- Verify foreign key relationships
- Contact: [Your support contact]

## Version History

- **v1.0** (2025-11-30): Initial slip-level control implementation
