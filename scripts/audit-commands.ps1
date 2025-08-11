# Generate repo tree
Get-ChildItem -Recurse -File | Select-Object FullName | Out-File .\audit\REPO_TREE_FULL.txt -Encoding utf8

# Supabase schema snapshot (requires supabase CLI configured)
if (Get-Command supabase -ErrorAction SilentlyContinue) {
  supabase db pull > .\audit\SCHEMA_SNAPSHOT.sql
}

# Migrations list
Get-ChildItem .\supabase\migrations\ -File | Sort-Object Name | Select-Object Name | Out-File .\audit\MIGRATIONS_LIST.txt -Encoding utf8

# Optional psql checks (requires psql and supabase linked)
if ($env:SUPABASE_DB_CONNECTION_STRING) {
  $cs = $env:SUPABASE_DB_CONNECTION_STRING
  psql $cs -c "SELECT schemaname, relname AS index_name, pg_size_pretty(pg_relation_size(relid)) AS index_size, idx_scan AS index_scans FROM pg_stat_user_indexes JOIN pg_index USING (indexrelid) WHERE idx_scan = 0 ORDER BY pg_relation_size(relid) DESC;" > .\audit\UNUSED_INDEXES.txt
  psql $cs -c "SELECT schemaname, relname, n_live_tup AS row_count, pg_size_pretty(pg_total_relation_size(relid)) AS total_size FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;" > .\audit\TABLE_SIZES.txt
}

# Quick SQL verifications
# See report for the exact SQL to run manually if psql is unavailable.
