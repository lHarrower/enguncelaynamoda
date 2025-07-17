# Database Setup Instructions

## Current Issue
The app is running but the database tables are missing:
- `public.wardrobeItems` 
- `public.user_preferences`

## Quick Fix

### Option 1: Run SQL in Supabase Dashboard
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `scripts/setup-database.sql`
4. Click "Run" to execute the SQL

### Option 2: Use Supabase CLI (if Docker is available)
```bash
# Start local Supabase (requires Docker)
npx supabase start

# Apply migrations
npx supabase db push

# Or reset and apply all migrations
npx supabase db reset
```

### Option 3: Manual Table Creation
If you prefer to create tables manually, here are the essential tables:

#### wardrobeItems Table
```sql
CREATE TABLE public.wardrobeItems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT,
    color TEXT,
    size TEXT,
    season TEXT[],
    occasion TEXT[],
    style_tags TEXT[],
    image_url TEXT,
    purchase_date DATE,
    cost DECIMAL(10,2),
    times_worn INTEGER DEFAULT 0,
    last_worn DATE,
    confidence_rating INTEGER CHECK (confidence_rating >= 1 AND confidence_rating <= 5),
    fit_rating INTEGER CHECK (fit_rating >= 1 AND fit_rating <= 5),
    comfort_rating INTEGER CHECK (comfort_rating >= 1 AND comfort_rating <= 5),
    versatility_score DECIMAL(3,2),
    care_instructions TEXT,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_preferences Table
```sql
CREATE TABLE public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    notification_time TIME DEFAULT '06:00:00',
    timezone TEXT DEFAULT 'UTC',
    confidence_note_style TEXT DEFAULT 'encouraging',
    enable_weekends BOOLEAN DEFAULT TRUE,
    enable_quick_options BOOLEAN DEFAULT TRUE,
    share_usage_data BOOLEAN DEFAULT FALSE,
    allow_location_tracking BOOLEAN DEFAULT TRUE,
    enable_social_features BOOLEAN DEFAULT TRUE,
    data_retention_days INTEGER DEFAULT 365,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## After Setup
Once the tables are created, the AYNA Mirror will work properly and the database errors will be resolved.

## Current Status ✅
- ✅ App is running successfully
- ✅ Navigation integration working
- ✅ Authentication working
- ✅ AYNA Mirror screen accessible
- ⚠️ Database tables need to be created
- ✅ Icon issue fixed (changed to 'glasses')

The integration is complete - just need to set up the database tables!