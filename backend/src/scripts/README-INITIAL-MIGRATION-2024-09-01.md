# Initial migration

Update the database url in .env with the RDS one.

The commands that were executed.

```bash
cd backend
pnpm prisma migrate dev
pnpm ts-node scripts/popuplate-db-from-s3.ts
pnpm ts-node scripts/add-metadata-to-document-table.ts
```
