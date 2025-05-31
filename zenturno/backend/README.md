# ZenTurno Backend

Backend API for ZenTurno, a simplified appointment booking platform for personal service businesses.

## Tech Stack

- Node.js with Express.js
- TypeScript
- PostgreSQL (Docker)
- Prisma ORM
- JWT Authentication
- Docker & Docker Compose

## Prerequisites

- Node.js v18+
- npm v9+
- Docker and Docker Compose
- Git

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd zenturno/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zenturno
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your_smtp_password
```

Alternatively, run the setup script which will create this file for you:

```bash
chmod +x setup-prisma.sh
./setup-prisma.sh
```

### 4. Start the PostgreSQL container

```bash
docker-compose up -d postgres
```

### 5. Initialize Prisma

```bash
npx prisma generate
npx prisma migrate dev --name initial
```

Or use the setup script which handles this for you:

```bash
./setup-prisma.sh
```

### 6. Start the server

```bash
npm run dev
```

The server will be running at `http://localhost:3001`.

## API Documentation

### Authentication

- `POST /api/auth/login`: Login with email and password
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password with token

### Users

- `GET /api/users/me`: Get current user profile
- `PUT /api/users/me`: Update current user profile
- `GET /api/users/:id`: Get user by ID (admin only)
- `GET /api/users`: Get all users (admin only)

### Appointments

- `POST /api/appointments`: Create a new appointment
- `GET /api/appointments/my`: Get current user's appointments
- `GET /api/appointments/:id`: Get appointment by ID
- `PUT /api/appointments/:id/cancel`: Cancel an appointment
- `GET /api/appointments`: Get all appointments (admin/professional only)

### Professionals

- `GET /api/professionals`: Get all professionals
- `GET /api/professionals/:id`: Get professional by ID
- `GET /api/professionals/:id/availability`: Get professional's availability
- `POST /api/professionals`: Create a new professional (admin only)
- `PUT /api/professionals/:id`: Update a professional (admin only)

### Services

- `GET /api/services`: Get all services
- `GET /api/services/:id`: Get service by ID
- `POST /api/services`: Create a new service (admin only)
- `PUT /api/services/:id`: Update a service (admin only)

## Development

### Useful Prisma Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset the database (for development only)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Running Tests

```bash
npm test
```

## Migration from Supabase

For detailed information about the migration from Supabase to local PostgreSQL with Prisma, see the [MIGRATION.md](./MIGRATION.md) file.
