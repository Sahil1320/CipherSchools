## CipherSQLStudio (Assignment)

This repository contains a full-stack **CipherSQLStudio** prototype:
- **Frontend**: React + Vite with vanilla SCSS, Monaco-based SQL editor, and a mobile-first layout.
- **Backend**: Node/Express API with PostgreSQL as a sandbox database, MongoDB for assignments and attempts, and Gemini-based hint generation.

### High-level architecture

- The **React UI** calls the **Express API** via JSON over HTTP.
- Express exposes routes under `/api`:
  - `GET /api/assignments` – list of assignments.
  - `GET /api/assignments/:id` – single assignment with schema details.
  - `POST /api/queries/execute` – execute a single, read-only `SELECT` query.
  - `POST /api/hints` – request a contextual SQL hint from Gemini.
- The API reads **assignments/attempts** from **MongoDB** and executes queries against a **PostgreSQL** sandbox database.

Data flow (textual description of the required diagram):
1. The **browser** sends a request (e.g. execute query) from React to `ExpressAPI` at `/api/queries/execute`.
2. `ExpressAPI` validates the payload and forwards it to `QueryRoutes`.
3. `QueryRoutes` uses `PostgreSQLSandbox` to run the SQL and stores an attempt document in `MongoDBAttempts`.
4. The result (or error) is returned back through `QueryRoutes` → `ExpressAPI` → **ReactUI**, which renders the table.
5. When the user clicks **Get Hint**, `HintRoutes` calls **GeminiLLM** with the assignment description, table schemas, and the user’s last SQL attempt to generate a short hint, which is then displayed in the UI.

You can mirror this description into a hand-drawn data-flow diagram with the following nodes and arrows:
- Nodes: `UserBrowser`, `ReactUI`, `ExpressAPI`, `AssignmentRoutes`, `QueryRoutes`, `HintRoutes`, `MongoDB`, `PostgreSQLSandbox`, `GeminiLLM`, `MongoDBAttempts`.
- Edges:
  - `UserBrowser → ReactUI` (user actions).
  - `ReactUI → ExpressAPI` (REST JSON).
  - `ExpressAPI → AssignmentRoutes` and `→ QueryRoutes` and `→ HintRoutes`.
  - `AssignmentRoutes ↔ MongoDB`.
  - `QueryRoutes ↔ PostgreSQLSandbox` and `QueryRoutes ↔ MongoDBAttempts`.
  - `HintRoutes ↔ MongoDB` (context) and `HintRoutes ↔ GeminiLLM`.

### Environment variables

Create a `.env` file in the `backend` directory with:

```bash
POSTGRES_URL=postgres://user:password@localhost:5432/ciphersql_sandbox
MONGODB_URI=mongodb://localhost:27017/ciphersqlstudio
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

### Backend setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Prepare the PostgreSQL database:
   - Create a database named `ciphersql_sandbox`.
   - Create the tables and sample data that match the assignments (e.g. `customers`, `orders`, `movies`, `ratings`). You can do this manually or via SQL scripts under `backend/sql` (to be customized for your own schemas).
3. Start the API server:
   ```bash
   npm run dev
   ```

Key backend files:
- `src/index.js` – Express bootstrap, route wiring, health check.
- `src/config/env.js` – environment variable loading and validation.
- `src/db/postgres.js` – PostgreSQL client.
- `src/db/mongo.js` – MongoDB client.
- `src/routes/assignments.js` / `src/services/assignmentsService.js` – assignments listing and seeding.
- `src/routes/queries.js` / `src/services/queryService.js` – SQL execution with safety checks (only `SELECT`, single statement).
- `src/routes/hints.js` / `src/services/hintsService.js` – Gemini hint integration.

### Frontend setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file (or `.env.local`) in `frontend`:
   ```bash
   VITE_API_BASE_URL=http://localhost:4000/api
   ```
3. Start the dev server (requires Node 20.19+ or 22.12+):
   ```bash
   npm run dev
   ```

Key frontend files:
- `src/App.jsx` – router shell with `AssignmentListPage` and `AssignmentAttemptPage`.
- `src/api/client.js` – small HTTP client for calling the backend.
- `src/pages/AssignmentListPage.jsx` – lists assignments with difficulty filter and search.
- `src/pages/AssignmentAttemptPage.jsx` – question panel, schema viewer, Monaco editor, results table, and hint panel.
- `src/styles/main.scss` and partials – mobile-first SCSS using variables, mixins, and BEM-like class names.

# Data Flow

1. User writes a SQL query in the editor.
2. Frontend sends the query to the backend API.
3. Backend validates the query and executes it in PostgreSQL.
4. Query results are returned and displayed in the UI.
5. If the user requests a hint:
   - Backend gathers assignment context and previous attempts.
   - Sends a prompt to the Gemini API.
   - Receives an AI-generated hint.
   - Displays the hint in the frontend.

---

# ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Sahil1320/CipherSchools.git


