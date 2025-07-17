# AYNA Mirror Database Migrations

This directory contains SQL migration files for the AYNA Mirror Daily Ritual feature.

## Migration Files

1. **001_ayna_mirror_schema.sql** - Core database schema
   - Enhanced wardrobe_items table with intelligence features
   - daily_recommendations table for storing daily outfit suggestions
   - outfit_recommendations table for individual outfit options
   - outfit_feedback table for user ratings and responses
   - user_preferences table for personalization settings
   - Indexes and Row Level Security (RLS) policies

2. **002_wardrobe_functions.sql** - Database functions
   - track_item_usage() - Update usage statistics when items are worn
   - get_wardrobe_utilization_stats() - Calculate wardrobe utilization metrics
   - update_item_confidence_score() - Update item confidence based on feedback
   - get_neglected_items() - Find items that haven't been worn recently
   - calculate_item_compatibility() - Placeholder for style compatibility scoring

## Running Migrations

### Using Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Apply all migrations
supabase db push

# Or apply specific migration
supabase db push --include-all
```

### Manual Application

If you need to apply migrations manually through the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file
4. Execute them in order (001, then 002)

## Migration Dependencies

- These migrations assume you have Supabase Auth set up with the `auth.users` table
- Row Level Security (RLS) policies are configured to work with Supabase Auth
- All tables are designed to work with the existing AynaModa authentication system

## Data Model Overview

```
auth.users (Supabase Auth)
├── wardrobe_items (enhanced with intelligence features)
├── user_preferences (notification and style settings)
├── daily_recommendations (daily outfit suggestions)
│   └── outfit_recommendations (individual outfit options)
│       └── outfit_feedback (user ratings and responses)
```

## Security

All tables have Row Level Security (RLS) enabled with policies that ensure:
- Users can only access their own data
- Proper authentication is required for all operations
- Data integrity is maintained through foreign key constraints

## Performance

Indexes are created on frequently queried columns:
- User ID fields for fast user-specific queries
- Date fields for time-based queries
- Usage tracking fields for analytics queries