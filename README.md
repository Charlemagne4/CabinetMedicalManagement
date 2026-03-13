## Cabinet Medical Management

This project is a **medical cabinet management web application** that helps clinic staff and admins manage users, work shifts, and daily financial operations (consultations, expenses, credits, and revenues), with an admin dashboard for analytics.

It is built on top of the T3 Stack (Next.js, NextAuth, Prisma, Tailwind CSS, tRPC) and extends it with MongoDB (via Prisma) and Upstash Redis for rate limiting.

Link: https://cabinet-medical-management.vercel.app
---

### What the project does

- **User management**
  - Users have roles (for example `admin` and regular users) and can be activated/deactivated.
  - Admins can assign users to predefined shift templates.
  - Password reset and registration flows are implemented on the server.
- **Authentication & authorization**
  - Credentials-based authentication using NextAuth.
  - Protected routes:
    - `/main` requires a valid session.
    - `/dashboard` additionally requires admin role (checked in middleware).
- **Shift management**
  - Models and APIs for shifts and shift templates, including morning/evening shift types.
  - Helpers to start shifts on login and to fetch the current active shift.
- **Financial and operational tracking**
  - Tracks consultations, expenses, revenues (`Recette`), credits, and generic operations.
  - Supports converting consultations to credits and marking credits as paid.
  - Provides dashboard data: totals for revenues/expenses, expected vs net profit, paid/unpaid credits, and activity summaries.
- **Dashboard & main UI**
  - `/dashboard` shows charts, summaries, and activity using TRPC-backed data.
  - `/main` is the main application area where users interact with entries, users, and other modules.

All of this behavior is implemented in the Prisma schema, TRPC routers, and React/Next.js modules under `src/`.

---

### Tech stack and key dependencies

- **Framework & language**
  - `next` `^16.1.6` (App Router, `src/app/**`)
  - `react` `^19.0.0`, `react-dom` `^19.0.0`
  - TypeScript (`typescript` `^5.8.2`)
- **Authentication**
  - `next-auth` `^5.0.0-beta.30` with `@auth/prisma-adapter`
- **API layer**
  - tRPC v11: `@trpc/server`, `@trpc/react-query`, `@trpc/client`
  - `@tanstack/react-query`, `@tanstack/react-query-devtools` for data fetching
- **Database & ORM**
  - Prisma (`prisma`, `@prisma/client`) with **MongoDB** (`provider = "mongodb"` in `prisma/schema.prisma`)
- **Caching & rate limiting**
  - Upstash Redis: `@upstash/redis`
  - Upstash Ratelimit: `@upstash/ratelimit`
- **UI & styling**
  - Tailwind CSS 4 (`tailwindcss`, `@tailwindcss/postcss`)
  - Radix UI primitives (`@radix-ui/react-*`) with custom wrappers in `src/components/ui`
  - `lucide-react` icons
  - Charts via `chart.js`, `react-chartjs-2`, and `recharts`
  - `react-day-picker`, `date-fns`, `dayjs` for date handling
  - `next-themes` for theme switching
- **Validation, logging, and utilities**
  - `zod` for schema and environment validation
  - `pino` and `pino-pretty` for logging
  - Various utility packages like `clsx`, `class-variance-authority`, `usehooks-ts`

See `package.json` and `prisma/schema.prisma` for the complete dependency and data model details.

---

### Project structure (key folders and files)

- `src/app/`
  - `layout.tsx`: Root layout; wires up theme provider, TRPC, React Query, session provider, and global styles.
  - `page.tsx`: Landing page that links to `/main`.
  - `(auth)/signin/page.tsx`: Custom sign-in page for credentials-based auth.
  - `(home)/main/page.tsx`: Main application page.
  - `(home)/dashboard/page.tsx`: Admin dashboard page; uses server-side TRPC calls and `DashboardView`.
  - `api/trpc/[trpc]/route.ts`: HTTP handler for the TRPC API.
  - `api/auth/[...nextauth]/route.ts`: NextAuth API route with Prisma adapter and credentials provider.
- `src/server/`
  - `db.ts`: Prisma client setup using `DATABASE_URL`.
  - `auth/`: NextAuth configuration and helpers.
  - `api/root.ts`: Root TRPC router combining domain routers.
  - `api/routers/entries.ts`: Financial/operational logic (consultations, credits, expenses, dashboard data).
  - `api/routers/users.ts`: User operations (registration, activation, reset password, shift assignment).
  - `api/routers/shifts.ts`: Shift-related operations (creation and management of shifts/templates).
- `src/trpc/`
  - `react.tsx`: TRPC React provider and client setup (with React Query).
  - `server.ts`: Helpers for using TRPC in React Server Components (RSC) with hydration.
- `src/modules/`
  - `dashboard/`: Dashboard view and sections (summary, charts, activity).
  - `Entries/`: Components and pages for entries, credits, depenses, and related forms.
  - `users/`: User list, detail views, and modals.
  - `auth/`: Authentication-related UI and logic.
  - `main/`: Main app layout and related components.
- `src/components/ui/`
  - Reusable UI primitives (buttons, dialogs, tables, forms, inputs, tabs, selects, tooltips, etc.) built on Radix UI.
- `src/lib/`
  - `redis.ts`: Upstash Redis client.
  - `ratelimit.ts`: Upstash Ratelimit configuration.
  - `dayjs.ts`, `utils.ts`: Miscellaneous helpers.
- `src/env.js`
  - Centralized environment variable validation and export using `@t3-oss/env-nextjs` and `zod`.
- `prisma/schema.prisma`
  - Prisma schema defining MongoDB models for users, shifts, consultations, recettes, depenses, credits, operations, and related enums.

---

### Scripts and commands

All scripts are defined in `package.json` and use `npm` (package manager: `npm@11.4.0`).

- **Development**
  - **`npm run dev`** – Start the Next.js development server.
- **Build & production**
  - **`npm run build`** – Build the application for production.
  - **`npm run start`** – Start the production server (after `npm run build`).
  - **`npm run preview`** – Build and then start the production server in one command.
- **Type checking & linting**
  - **`npm run check`** – Run ESLint and TypeScript type-checking.
  - **`npm run typecheck`** – Type-check using `tsc --noEmit`.
  - **`npm run lint`** – Run ESLint.
  - **`npm run lint:fix`** – Run ESLint with automatic fixes.
- **Formatting**
  - **`npm run format:check`** – Check formatting with Prettier.
  - **`npm run format:write`** – Apply Prettier formatting.
- **Database (Prisma)**
  - **`npm run db:generate`** – `prisma migrate dev` (apply migrations in development).
  - **`npm run db:migrate`** – `prisma migrate deploy` (apply migrations in deploy/production).
  - **`npm run db:push`** – `prisma db push` (sync schema to the database without migrations).
  - **`npm run db:studio`** – `prisma studio` (visual database explorer).
- **Post-install**
  - **`postinstall` (runs automatically)** – `prisma generate` (generate Prisma client).

---

### Installation and running the project

1. **Install dependencies**
   - Run:
     - `npm install`
2. **Set up the environment variables**
   - Create a `.env` file in the project root (see the example values already present in `.env`).
   - At minimum, the following server-side variables are required by `src/env.js`:
     - `AUTH_DISCORD_ID`
     - `AUTH_DISCORD_SECRET`
     - `DATABASE_URL`
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
   - In production, `AUTH_SECRET` is also required; it is used by NextAuth and middleware for JWT.
   - `NODE_ENV` is optional (defaults to `"development"`), but is used for environment-specific behavior.
3. **Configure the database**
   - Ensure `DATABASE_URL` points to a MongoDB instance.
   - To create/update the schema, you can use:
     - `npm run db:generate` (development migrations), or
     - `npm run db:push` (push the schema directly).
4. **Run the development server**
   - Run:
     - `npm run dev`
   - By default, the app will be available at `http://localhost:3000` (or at the port specified by `PORT`).
5. **Build and run for production**
   - Build:
     - `npm run build`
   - Start:
     - `npm run start`

All of the commands and requirements above are taken directly from the project’s `package.json`, `src/env.js`, and database/auth configuration files.
