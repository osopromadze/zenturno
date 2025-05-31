# ZenTurno Troubleshooting Guide

This guide addresses common issues you might encounter when working with PostgreSQL and Prisma in the ZenTurno application.

## Database Connection Issues

### Problem: Cannot connect to PostgreSQL database

**Symptoms:**
- Error messages like "Could not connect to database"
- `PrismaClientInitializationError` when starting the server

**Solutions:**
1. **Check if Docker is running:**
   ```bash
   docker ps
   ```
   If you don't see the PostgreSQL container, start it:
   ```bash
   docker-compose up -d postgres
   ```

2. **Verify DATABASE_URL in .env file:**
   Ensure your connection string is correct:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zenturno
   ```

3. **Check PostgreSQL container logs:**
   ```bash
   docker logs $(docker ps -q --filter name=postgres)
   ```

4. **Try connecting with psql:**
   ```bash
   docker exec -it $(docker ps -q --filter name=postgres) psql -U postgres -d zenturno
   ```

## Prisma Schema Issues

### Problem: Prisma migration fails

**Symptoms:**
- Errors during `prisma migrate dev`
- Messages about conflicts or invalid schema

**Solutions:**
1. **Reset the database (development only):**
   ```bash
   npx prisma migrate reset --force
   ```

2. **Check schema syntax:**
   Validate your schema:
   ```bash
   npx prisma validate
   ```

3. **Resolve conflicts:**
   If there are conflicts between your schema and existing database:
   ```bash
   npx prisma db pull
   ```
   Then compare the generated schema with your intended schema and resolve differences.

### Problem: Type errors in generated Prisma client

**Symptoms:**
- TypeScript errors related to Prisma models
- Missing properties or methods

**Solution:**
Regenerate the Prisma client:
```bash
npx prisma generate
```

## Repository Implementation Issues

### Problem: Repository methods not working as expected

**Symptoms:**
- Unexpected query results
- Runtime errors in repository methods

**Solutions:**
1. **Check Prisma query syntax:**
   Review the [Prisma documentation](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference) for correct query syntax.

2. **Use Prisma Studio to inspect data:**
   ```bash
   npx prisma studio
   ```

3. **Add debug logs:**
   Add `console.log` statements to repository methods to see the query parameters and results.

## Controller Issues

### Problem: Controllers not receiving correct data from repositories

**Symptoms:**
- API endpoints returning unexpected results
- 500 errors from controllers

**Solutions:**
1. **Check request validation:**
   Ensure your controllers properly validate incoming request data.

2. **Verify repository method calls:**
   Check that controllers are calling repository methods with correct parameters.

3. **Test repository methods directly:**
   Create a simple test script to call repository methods directly and verify results.

## Authentication Issues

### Problem: JWT authentication not working

**Symptoms:**
- "Unauthorized" errors when accessing protected routes
- JWT verification failures

**Solutions:**
1. **Check JWT_SECRET in .env file:**
   Ensure it's set and matches the one used to generate tokens.

2. **Verify token generation:**
   Check the login/register controller to ensure tokens are being generated correctly.

3. **Test token manually:**
   Use a tool like [jwt.io](https://jwt.io/) to decode and verify tokens.

## Data Seeding Issues

### Problem: Missing or incorrect data after seeding

**Symptoms:**
- Expected data not appearing in PostgreSQL after seeding
- Relationships between entities not preserved

**Solutions:**
1. **Check seed script for errors:**
   Review the seed.js file for any logical errors or missing relationships.

2. **Reset the database and re-seed:**
   ```bash
   npx prisma migrate reset --force
   npm run seed
   ```

3. **Manually inspect the database:**
   ```bash
   npx prisma studio
   ```

## Performance Issues

### Problem: Slow queries after migration

**Symptoms:**
- API endpoints taking longer to respond
- High database CPU usage

**Solutions:**
1. **Check indexes:**
   Ensure your Prisma schema defines appropriate indexes for frequently queried fields.

2. **Review query complexity:**
   Some complex queries might need optimization. Use Prisma's `select` to limit returned fields.

3. **Enable query logging:**
   Set the `log` parameter in your Prisma client initialization to see slow queries:
   ```typescript
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   });
   ```

## Deployment Issues

### Problem: Application fails to start in production

**Symptoms:**
- Server crashes on startup in production environment
- Database connection errors in production logs

**Solutions:**
1. **Generate Prisma client in production build:**
   Add to your build script:
   ```json
   "build": "tsc && npx prisma generate"
   ```

2. **Verify production environment variables:**
   Ensure all required environment variables are set in your production environment.

3. **Run migrations in production:**
   ```bash
   npx prisma migrate deploy
   ```

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Prisma documentation](https://www.prisma.io/docs/)
2. Search for similar issues on [GitHub](https://github.com/prisma/prisma/issues)
3. Ask for help in the [Prisma community](https://www.prisma.io/community)
4. Review the migration code and logs for specific error messages
