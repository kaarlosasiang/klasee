# Deployment Guide

## Prerequisites

- Node 22
- pnpm 9.15.9 (`npm install -g pnpm@9.15.9`)
- Docker + Docker Compose v2

## Local Development

```bash
# Install dependencies
pnpm install

# Start API (port 4000) + Web (port 3000)
pnpm dev
```

## Production Deployment

### 1. Configure environment variables

Copy the example files and fill in all values:

```bash
cp apps/api/.env.example apps/api/.env
```

Create a `.env` at the repo root for docker-compose secrets:

```
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=<strong-password>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=klasee
```

### 2. Production checklist

- `BETTER_AUTH_SECRET` must be ≥32 characters (generate with `openssl rand -base64 32`)
- `MONGODB_URI` must include credentials matching `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD`
- `FRONTEND_URL` and `CORS_ORIGIN` in `apps/api/.env` must match `NEXT_PUBLIC_APP_URL`
- OAuth redirect URIs must be updated in Google/GitHub developer consoles

### 3. Start all services

```bash
docker-compose -f docker-compose.prod.yml --env-file .env up -d
```

Services started:
- **mongodb** — MongoDB 7 with auth, data persisted in named volume
- **api** — Express API on internal port 4000
- **web** — Next.js standalone on internal port 3000
- **nginx** — Reverse proxy on ports 80/443

### 4. SSL with Certbot

```bash
# Obtain certificate (replace yourdomain.com)
docker run --rm -v certbot_conf:/etc/letsencrypt -v certbot_www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot -d yourdomain.com

# Update apps/nginx/default.conf to add HTTPS server block, then reload nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### 5. Useful commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web

# Restart a service after code change
docker-compose -f docker-compose.prod.yml up -d --build api

# Stop all services
docker-compose -f docker-compose.prod.yml down
```

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `develop` and every PR to `master`:

1. **lint** — `pnpm lint`
2. **typecheck** — `pnpm typecheck`
3. **build** — `pnpm build` (runs after lint + typecheck pass)
4. **docker-build** — builds Docker images without pushing (runs on push to `master` only)

To push images to a registry, add `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` secrets to the GitHub repo and update the `docker-build` job with `push: true` and `tags`.
