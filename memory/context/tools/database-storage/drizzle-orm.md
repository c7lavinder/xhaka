# Drizzle ORM

**Category:** Database & Storage
**Status:** 🟢 Active
**Last Updated:** 2026-03-14

## Purpose
Type-safe ORM for Gunner's database. Defines schema, handles migrations, and provides query layer for all Gunner backend operations.

## Usage in Stack
- **Gunner:** Primary ORM for PostgreSQL (Supabase/Railway postgres). 76 tables.
- **TiDB:** Drizzle has native TiDB Serverless support via `drizzle-orm/tidb-serverless`

---

## Current State (2026)

- **Drizzle ORM:** v1.0 beta (v1.0.0-beta.2 is current as of early 2026)
- **Drizzle Kit:** Companion CLI tool for migrations and schema management
- **TiDB support:** First-class. Native driver: `@tidbcloud/serverless` + `drizzle-orm/tidb-serverless`

---

## TiDB Compatibility

TiDB is MySQL-compatible. Two ways to connect:

```typescript
// Option 1: Native TiDB Serverless driver (recommended)
import { drizzle } from 'drizzle-orm/tidb-serverless';
const db = drizzle(process.env.DATABASE_URL!);

// Option 2: Standard MySQL2 driver (also works)
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);
```

Use **Option 1** (TiDB native driver) — it uses HTTP/HTTPS transport instead of TCP, which works better in serverless environments (Railway, Vercel, etc.) without connection pool issues.

---

## Migration Workflow

```bash
# Generate migration files from schema changes
npx drizzle-kit generate

# Push schema directly to DB (dev only — skips migration files)
npx drizzle-kit push

# Apply pending migrations to database
npx drizzle-kit migrate

# Open Drizzle Studio (visual DB browser)
npx drizzle-kit studio
```

**Production workflow:**
1. Edit schema in `src/db/schema.ts`
2. Run `drizzle-kit generate` → creates SQL migration file in `/drizzle/` folder
3. Review migration SQL before applying
4. Run `drizzle-kit migrate` → applies to production DB
5. Commit both schema change AND migration file together

**Never use `drizzle-kit push` in production** — it modifies schema directly without migration file.

---

## Known Gotchas

### 1. MySQL Mode PK Bug (v1.0 beta)
`drizzle-kit generate` in MySQL mode sometimes doesn't correctly detect existing primary keys, leading to incorrect ALTER TABLE statements. **Always review generated SQL** before running migrations.

Fix: Add `primaryKey()` explicitly to column definitions, don't rely on auto-detection.

### 2. Unique Key Naming with casing config
If you have `casing: 'snake_case'` in your Drizzle config, unique key names for multi-column unique constraints may not respect the casing configuration in generated SQL. ⚠️ Verify this in your migration output.

### 3. JSONB column defaults (PostgreSQL)
`drizzle-kit push` fails if target Postgres DB has a JSONB column with a default value set directly in the DB (not in schema). Workaround: set defaults in Drizzle schema, not in raw SQL.

### 4. Migration ordering
Known bug: `drizzle-kit generate` can generate out-of-order migrations in some edge cases (e.g., adding FK before referenced table). Always read through migration files before applying.

### 5. TiDB: No foreign key enforcement by default
TiDB parses FK syntax but doesn't enforce FK constraints at the storage level by default. This means your Drizzle schema can have FKs defined but they won't actually prevent orphan rows. Add app-level validation for critical relationships.

### 6. TiDB: `AUTO_INCREMENT` vs `AUTO_RANDOM`
TiDB recommends `AUTO_RANDOM` instead of `AUTO_INCREMENT` for primary keys (better distributed writes). Drizzle doesn't generate `AUTO_RANDOM` natively — you may need a raw SQL migration for high-write tables.

---

## Smart Use Tips

1. **Drizzle Studio in prod:** Run `npx drizzle-kit studio --port 4983` and tunnel to it via Railway CLI or SSH during debugging. No need for a separate DB client.

2. **Type-safe queries without raw SQL:** Use Drizzle's relational query builder (`.query.users.findMany({ with: { posts: true } })`) instead of joins — it generates optimal SQL and is fully type-safe.

3. **`$inferInsert` and `$inferSelect`:** Use these TypeScript utilities instead of manually defining input/output types:
   ```typescript
   type NewUser = typeof usersTable.$inferInsert;
   type User = typeof usersTable.$inferSelect;
   ```

4. **Batch queries:** Drizzle supports `db.batch([...])` for TiDB/SQLite — sends multiple queries in one round trip. Big latency win in serverless environments.

---

## Alternatives Worth Knowing

| ORM | Pros | Cons | Verdict |
|-----|------|------|---------|
| Prisma | Mature, great DX | Heavier, slower startup | Fine choice but Drizzle better for edge/serverless |
| Kysely | Pure SQL builder, type-safe | No schema/migration management | Too manual |
| TypeORM | Feature-rich | TypeScript types are a mess | Avoid |

Drizzle is the right choice for this stack. No change needed.
