# Legacy migrations

These incremental SQL files targeted the old InsForge / mixed UUID schema.
Fresh installs should only run `../0001_init.sql` via `npm run db:migrate`.
