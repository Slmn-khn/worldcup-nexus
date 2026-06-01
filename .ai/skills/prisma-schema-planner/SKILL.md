---
name: prisma-schema-planner
description: Use when designing or changing Prisma models, migrations, relations, indexes, and derived stats tables for WorldCup Atlas.
---

# Prisma Schema Planner Skill

When changing the database:

1. Read `docs/DATA_MODEL.md`.
2. Keep historical entities normalized.
3. Use stable IDs and slugs.
4. Add indexes for common filters:
   - tournament year
   - country slug
   - player slug
   - match date
   - stage
   - event type
5. Avoid destructive migrations without documenting impact.
6. Keep derived stats separate from raw imported events.
7. Add seed or verification scripts when schema changes affect data import.