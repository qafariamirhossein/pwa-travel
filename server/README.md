# Backend API Server

This is a simple Express.js server that connects to your Postgres database and provides REST API endpoints for the frontend.

## Why a Separate API?

You **cannot** connect directly to Postgres from a browser because:

1. **Security**: Database connection strings contain passwords that must never be exposed in frontend code
2. **Browser limitations**: Browsers don't have native Postgres client libraries
3. **Network restrictions**: Direct database connections are blocked by CORS and firewalls

The API server runs on the backend where it can safely use your Postgres connection string.

## Setup

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Set up your `.env` file** in the project root:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   PORT=3000
   ```

3. **Initialize your database** (if not already done):
   ```bash
   npm run init-db
   ```

## Running the Server

### Development (with auto-reload):
```bash
npm run dev:server
```

### Production:
```bash
npm run server
```

The server will start on `http://localhost:3000` (or the port specified in `PORT`).

## API Endpoints

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create or update a trip
- `DELETE /api/trips/:id` - Delete a trip

### Itinerary
- `GET /api/trips/:tripId/itinerary` - Get itinerary items for a trip
- `POST /api/itinerary` - Create or update an itinerary item
- `DELETE /api/itinerary/:id` - Delete an itinerary item

### Expenses
- `GET /api/trips/:tripId/expenses` - Get expenses for a trip
- `POST /api/expenses` - Create or update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Notes
- `GET /api/trips/:tripId/notes` - Get notes for a trip
- `POST /api/notes` - Create or update a note
- `DELETE /api/notes/:id` - Delete a note

### Health Check
- `GET /health` - Check if server is running

## Frontend Configuration

Update your frontend `.env` file to point to the API:

```env
VITE_API_URL=http://localhost:3000
```

For production, use your deployed API URL:

```env
VITE_API_URL=https://your-api-domain.com
```

## Deployment

You can deploy this server to:
- **Vercel** (serverless functions)
- **Railway**
- **Render**
- **Fly.io**
- **Any Node.js hosting**

Make sure to set the `DATABASE_URL` environment variable in your hosting platform.

## Security Notes

- The server uses CORS to allow requests from your frontend
- Database credentials are kept server-side only
- Consider adding authentication/authorization for production use
- Use HTTPS in production

