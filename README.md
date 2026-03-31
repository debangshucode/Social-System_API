# Social System

Social System is a NestJS + EJS social app with authentication, profiles, posts, comments, likes, follow requests, notifications, and avatar upload.

## Live App

- https://social-systemapi-production.up.railway.app/feed

## Tech Stack

- NestJS (TypeScript)
- PostgreSQL + TypeORM (migrations, `synchronize: false`)
- EJS (SSR pages)
- JWT auth (access + refresh)
- Cookie-based web auth
- Swagger docs

## Core Features

- User signup/login/logout
- Profile creation and profile pages
- Feed and post detail pages
- Create posts (text + media metadata support)
- Like/unlike and comments
- Follow/unfollow with pending request flow
- Notification page for follow requests (accept/reject)
- Search users
- Avatar upload flow (Cloudinary-based in current setup)

## API and SSR Routing

- API base prefix: `/api`
- SSR routes are excluded from prefix (like `/feed`, `/profile`, `/notification`, etc.)
- Swagger docs: `/docs`

## Project Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file in project root.

```env
# App
PORT=3000
NODE_ENV=development

# Database (choose either DATABASE_URL or split DB vars)
DATABASE_URL=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary (currently required by config validation)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Run the App

```bash
# dev
npm run start:dev

# prod build + run
npm run build
npm run start:prod
```

## Database Migrations

```bash
# create empty migration
npm run migration:create -- src/db/migrations/<name>

# generate migration from entity diffs
npm run migration:generate -- src/db/migrations/<name>

# run migrations
npm run migration:run

# revert last migration
npm run migration:revert

# show migration status
npm run migration:show
```

## Tests

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Folder Highlights

- `src/web` - SSR controllers, auth guard, web middleware
- `src/auth` - JWT strategies, auth services/controllers
- `src/posts`, `src/comments`, `src/likes`, `src/follow` - social modules
- `src/db/migrations` - migration files
- `views/` - EJS pages/layouts/partials
- `public/` - static files (CSS, assets)

## Notes

- App uses global validation pipe with whitelist + transform.
- Global throttling is enabled.
- Post media upload can be integrated with Multer (local storage) based on current branch changes.

