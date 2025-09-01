# Supabase Setup Guide for AYNAMODA

This guide will help you set up Supabase for the AYNAMODA project, including database configuration, authentication, storage, and security policies.

## 📋 Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Supabase CLI installed globally: `npm install -g supabase`
- Node.js and npm/yarn installed
- Basic understanding of PostgreSQL and SQL

## 🚀 Quick Start

### 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `aynamoda` (or your preferred name)
   - **Database Password**: Use a strong password (save this!)
   - **Region**: Choose the closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (usually 1-2 minutes)

### 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Add these to your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Initialize Supabase Locally (Optional)

```bash
# Navigate to your project directory
cd AYNAMODA

# Initialize Supabase
supabase init

# Link to your remote project
supabase link --project-ref your-project-id
```

### 4. Apply Database Migrations

```bash
# Apply all migrations to your Supabase project
supabase db push

# Or apply them one by one
supabase migration up
```

## 🗄️ Database Schema Overview

The AYNAMODA database includes the following main tables:

### Core Tables

1. **profiles** - User profile information
2. **wardrobe_items** - Individual clothing items
3. **outfits** - Saved outfit combinations
4. **outfit_items** - Junction table for outfit-wardrobe relationships
5. **style_analytics** - User style analysis data
6. **user_preferences** - User preferences and settings

### Storage Buckets

1. **avatars** - User profile pictures
2. **wardrobe-images** - Clothing item photos

## 🔐 Authentication Setup

### Enable Authentication Providers

1. Go to **Authentication** → **Providers**
2. Configure the providers you want to use:

#### Email Authentication (Default)
- Already enabled by default
- Configure email templates if needed

#### Google OAuth
1. Enable Google provider
2. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
3. Add authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`

#### Facebook OAuth (Optional)
1. Enable Facebook provider
2. Add your Facebook App credentials
3. Configure redirect URIs

### Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: `https://your-app-domain.com` (for production)
   - **Redirect URLs**: Add your app's deep link URLs
   - **JWT expiry**: Default (3600 seconds) or customize
   - **Enable email confirmations**: Recommended for production

## 📁 Storage Configuration

### Storage Buckets Setup

The migrations automatically create the required storage buckets:

1. **avatars** (public)
   - For user profile pictures
   - Public read access
   - User-specific write access

2. **wardrobe-images** (private)
   - For clothing item photos
   - User-specific read/write access

### Storage Policies

Row Level Security (RLS) policies are automatically applied:

- Users can only access their own files
- File size limit: 10MB
- Allowed formats: JPEG, PNG, WebP, HEIC

## 🛡️ Security Configuration

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Proper authentication is required
- Data isolation between users

### API Security

1. **Rate Limiting**: Configure in Supabase dashboard
2. **CORS Settings**: Add your app domains
3. **JWT Settings**: Use default secure settings

### Environment Security

```env
# Use different projects for different environments
# Development
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co

# Staging
EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co

# Production
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
```

## 🔧 Advanced Configuration

### Custom Functions

The project includes several PostgreSQL functions:

- `get_wardrobe_stats()` - Calculate wardrobe statistics
- `update_style_analysis()` - Update user style analysis
- `suggest_outfits()` - Generate outfit suggestions
- `get_wardrobe_cleanup_suggestions()` - Suggest items to remove
- `calculate_wardrobe_value()` - Calculate wardrobe financial metrics

### Triggers

- **Updated_at triggers**: Automatically update `updated_at` timestamps
- **Style analysis triggers**: Auto-update analysis when wardrobe changes
- **New user triggers**: Create profile and preferences for new users

### Indexes

Optimized indexes for:
- User-specific queries
- Category and color filtering
- Date-based queries
- Full-text search (if implemented)

## 📊 Monitoring and Analytics

### Database Monitoring

1. Go to **Reports** in Supabase dashboard
2. Monitor:
   - API requests
   - Database performance
   - Storage usage
   - Authentication events

### Query Performance

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 🚨 Troubleshooting

### Common Issues

#### Migration Errors
```bash
# Reset local database
supabase db reset

# Re-apply migrations
supabase db push
```

#### RLS Policy Issues
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

#### Storage Issues
```sql
-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check storage policies
SELECT * FROM storage.policies;
```

### Getting Help

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Community Discord**: [discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: [github.com/supabase/supabase](https://github.com/supabase/supabase)

## 📝 Best Practices

### Development

1. **Use Local Development**:
   ```bash
   supabase start  # Start local Supabase
   supabase stop   # Stop local Supabase
   ```

2. **Migration Management**:
   - Always create migrations for schema changes
   - Test migrations locally first
   - Use descriptive migration names

3. **Environment Separation**:
   - Use different Supabase projects for dev/staging/prod
   - Never use production data in development

### Production

1. **Security**:
   - Enable email confirmation
   - Set up proper CORS policies
   - Monitor authentication events
   - Regular security audits

2. **Performance**:
   - Monitor query performance
   - Set up database backups
   - Configure connection pooling
   - Use CDN for static assets

3. **Monitoring**:
   - Set up alerts for errors
   - Monitor API usage
   - Track storage usage
   - Regular performance reviews

## 🔄 Backup and Recovery

### Automated Backups

Supabase automatically creates daily backups for paid plans.

### Manual Backup

```bash
# Backup database schema and data
supabase db dump --data-only > backup.sql

# Restore from backup
psql -h your-host -U postgres -d postgres < backup.sql
```

### Migration Rollback

```bash
# Rollback last migration
supabase migration down

# Rollback to specific migration
supabase migration down --target 20240101000001
```

---

**Need help?** Check the [Supabase documentation](https://supabase.com/docs) or reach out to the AYNAMODA development team.