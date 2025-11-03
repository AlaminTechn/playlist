# Setup Instructions

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional)

### Option 1: Docker Compose (Easiest)

```bash
docker compose up
```

This will:
- Build both backend and frontend containers
- Run database migrations
- Seed the database
- Start both services

Access the application at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### Option 2: Manual Setup

#### Step 1: Install Dependencies

```bash
# Root directory
npm run install:all

# Or separately:
cd backend && npm install
cd ../frontend && npm install
```

#### Step 2: Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run migrations (creates database)
npm run db:migrate

# Seed database
npm run db:seed

# Start backend (in one terminal)
npm run dev
```

Backend will run on `http://localhost:4000`

#### Step 3: Setup Frontend

```bash
cd frontend

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:4000" >> .env.local

# Start frontend (in another terminal)
npm run dev
```

Frontend will run on `http://localhost:3000`

## Running Tests

```bash
cd backend
npm test
```

## Troubleshooting

### Database Issues
If you encounter database errors:
```bash
cd backend
# Delete existing database
rm dev.db dev.db-journal
# Recreate
npm run db:migrate
npm run db:seed
```

### Port Already in Use
If port 3000 or 4000 is already in use:
- Change PORT in `backend/.env`
- Change port in `frontend/package.json` scripts

### WebSocket Connection Issues
- Ensure backend is running before frontend
- Check `NEXT_PUBLIC_WS_URL` in frontend `.env.local`
- Verify backend WebSocket server is active (check console logs)

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

