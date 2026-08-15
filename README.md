# F1 2026 Prediction Game

A full-stack web app for predicting Formula 1 2026 race outcomes and championship standings, with a weighted prediction model and Monte Carlo championship simulation.

## Features

- Submit race-by-race predictions (winner + top 3) with a simple username-based login
- Live driver and constructor championship standings
- Weighted race-outcome predictor (historical performance, form, circuit fit, weather, qualifying)
- Monte Carlo simulation (10,000 runs) for championship win probabilities
- Prediction scoring and accuracy tracking
- Player leaderboard
- Driver stats: win rate, points average, form trend, consistency, head-to-head

## Tech Stack

**Frontend:** React, Vite

**Backend:** Node.js, Express, MongoDB, Mongoose

No JWT/bcrypt — auth uses a simple random token tied to each user.

## Project Structure

```
F1-2026-GP-Season-Calculator/
├── server/     Backend (Node.js/Express)
├── client/     Frontend (React)
└── README.md
```

### server/
- `index.js` — app entry point: middleware, DB connection, seeding, listen on port 5000
- `config/` — DB connection (`db.js`), constants (`constants.js`)
- `models/` — Mongoose schemas: `User`, `Race`, `Driver`, `Prediction`, `Leaderboard`, `RaceResult`
- `middleware/` — `auth.js` (token check), `errorHandler.js`, `validation.js`, `rateLimiter.js`
- `controllers/` — request handling for auth, drivers, races, predictions, leaderboard, championship
- `algorithms/`
  - `f1Points.js` — position → points (25/18/15/12/10/8/6/4/2/1)
  - `advancedPredictor.js` — weighted race-outcome score (historical 30%, form 25%, circuit 20%, weather 15%, qualifying 10%)
  - `monteCarlo.js` — 10,000-run championship simulation
  - `analytics.js` — win rate, points average, form trend, consistency (std. dev.), head-to-head
  - `predictionScoring.js` — +10 correct winner, +5 top-3 pick, accuracy %
  - `raceValidation.js` — validates race results before saving
- `routes/` — REST endpoints for auth, drivers, races, predictions, leaderboard, championship
- `services/leaderboardService.js` — leaderboard update logic
- `utils/` — `logger.js`, `cache.js` (5–10 min in-memory cache), `response.js` (standard response format)
- `seed/` — initial driver/race data and loader

### client/src/
- `App.jsx` — root component: auth state, panel switching, toasts
- `components/`
  - `AuthModal.jsx` — login/signup form
  - `Header.jsx` — nav bar
  - `ErrorBoundary.jsx` — catches render errors
  - `LoadingSpinner.jsx` — loading state
  - `PredictionPanel.jsx` — submit predictions
  - `StandingsPanel.jsx` — championship standings
  - `LeaderboardPanel.jsx` — player leaderboard
  - `MyPredictions.jsx` — your prediction history
  - `SimulationPanel.jsx` — championship win probabilities
- `hooks/useToast.js` — toast notifications
- `services/api.js` — API client with token header, retries (exponential backoff), 30s timeout

## API Endpoints

```
POST /api/auth/signup
POST /api/auth/signin
GET  /api/auth/me

GET  /api/drivers
GET  /api/drivers/:id
GET  /api/drivers/:id/stats

GET  /api/races
GET  /api/races/:id
POST /api/races/:id/result          (admin)

GET    /api/predictions
POST   /api/predictions
DELETE /api/predictions

GET /api/leaderboard

GET /api/championship/drivers
GET /api/championship/constructors
GET /api/championship/simulation
GET /api/championship/races/:id/predictions
GET /api/championship/drivers/:id/compare/:id2
```

## Installation

### Backend
```bash
cd server
npm install
cp .env.example .env      # add MONGODB_URI
npm run dev                # starts on port 5000
```

### Frontend
```bash
cd client
npm install
npm start                  # starts on port 5173
```

## Prediction Algorithm

Each driver's race-outcome score is a weighted sum:

```
Score = (Historical × 0.30) + (Form × 0.25) + (Circuit Fit × 0.20)
      + (Weather × 0.15) + (Qualifying × 0.10)
```

Each factor is scored 0–100; the result is a 0–100 confidence score.

## Championship Simulation

The Monte Carlo simulation runs the remaining season 10,000 times, using the predictor's win probabilities to randomly determine each race outcome and award points, then reports the percentage of simulations each driver wins.

## Security

- Token-based auth on protected routes
- Input validation and sanitization
- Rate limiting (5 req/min on auth, 100 req/min general)
- Centralized error handling with typed errors (`ValidationError`, `AuthenticationError`, `ConflictError`)
- CORS restricted to the frontend origin

## License

See [LICENSE](LICENSE).

## Disclaimer

This tool is for entertainment and analytical purposes. Predictions are based on historical data and statistical models — actual results may differ. Refer to official F1 channels for real standings and results.