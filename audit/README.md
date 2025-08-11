This folder stores audit artifacts generated during the repository audit.

Generated files:
- REPO_TREE_FULL.txt: Full repository file list
- SCHEMA_SNAPSHOT.sql: Supabase schema snapshot (if CLI configured)
- MIGRATIONS_LIST.txt: Ordered list of local migrations
- UNUSED_INDEXES.txt: Unused index report (if psql available)
- TABLE_SIZES.txt: Table sizes (if psql available)

You can regenerate these by running: scripts/audit-commands.ps1
