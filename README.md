# Westler

Full-stack web application consisting of three services:

| Service      | Tech                  | Default Port | Description                  |
| ------------ | --------------------- | ------------ | ---------------------------- |
| **backend**  | NestJS + Prisma (SQLite) | `3000`       | REST API & static uploads    |
| **frontend** | Next.js 16 (SSR)      | `3001`       | Public-facing website        |
| **admin**    | React + Vite (SPA)    | —            | Admin panel (static build)   |

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Local Development](#local-development)
4. [Production Deployment on Ubuntu + Nginx](#production-deployment-on-ubuntu--nginx)
   - [1. Server Preparation](#1-server-preparation)
   - [2. Clone & Install](#2-clone--install)
   - [3. Backend Setup](#3-backend-setup)
   - [4. Frontend Setup](#4-frontend-setup)
   - [5. Admin Panel Setup](#5-admin-panel-setup)
   - [6. PM2 Process Manager](#6-pm2-process-manager)
   - [7. Nginx Configuration](#7-nginx-configuration)
   - [8. SSL with Certbot (Let's Encrypt)](#8-ssl-with-certbot-lets-encrypt)
   - [9. Firewall (UFW)](#9-firewall-ufw)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Useful Commands](#useful-commands)
7. [Backup & Restore](#backup--restore)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Ubuntu** 22.04 / 24.04 LTS
- **Node.js** ≥ 20 (LTS) — we recommend installing via [nvm](https://github.com/nvm-sh/nvm)
- **npm** ≥ 10
- **Nginx** ≥ 1.18
- **PM2** (Node.js process manager)
- **Git**
- A registered **domain name** pointing to your server IP  
  (example used below: `westler.example.com` for API, `www.westler.example.com` for frontend, `admin.westler.example.com` for admin)

---

## Project Structure

```
westler/
├── backend/          # NestJS API server
│   ├── prisma/       # Prisma schema, migrations & seed
│   ├── src/          # Application source code
│   ├── uploads/      # User-uploaded media (served statically)
│   └── .env.example
├── frontend/         # Next.js public website
│   ├── app/          # Next.js App Router
│   ├── components/
│   ├── lib/
│   └── .env.example
├── admin/            # React + Vite admin panel (SPA)
│   ├── src/
│   └── .env.example
└── README.md
```

---

## Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Bekzod13/westler.git
cd westler

# 2. Backend
cd backend
cp .env.example .env          # edit .env as needed
npm install
npx prisma generate
npx prisma migrate deploy     # apply existing migrations
npm run db:seed               # seed initial data
npm run start:dev             # http://localhost:3000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local    # set NEXT_PUBLIC_API_URL
npm install
npm run dev                   # http://localhost:3000

# 4. Admin Panel (new terminal)
cd admin
cp .env.example .env          # set VITE_API_URL
npm install
npm run dev                   # http://localhost:5173
```

---

## Production Deployment on Ubuntu + Nginx

> **Conventions used below:**
>
> - Deploy user: `deploy` (non-root)
> - Project path: `/var/www/westler`
> - Domains:
>   - `api.westler.com` — Backend API
>   - `westler.com` / `www.westler.com` — Frontend
>   - `admin.westler.com` — Admin panel

Adjust domains and paths to match your setup.

---

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx ufw

# Install Node.js 22 via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm alias default 22
node -v   # should print v22.x.x

# Install PM2 globally
npm install -g pm2
```

---

### 2. Clone & Install

```bash
# Create project directory
sudo mkdir -p /var/www/westler
sudo chown $USER:$USER /var/www/westler

# Clone
cd /var/www
git clone https://github.com/Bekzod13/westler.git westler
cd westler

# Install dependencies for all services
cd backend  && npm ci && cd ..
cd frontend && npm ci && cd ..
cd admin    && npm ci && cd ..
```

---

### 3. Backend Setup

```bash
cd /var/www/westler/backend

# Create production .env
cp .env.example .env
```

Edit `.env` with production values:

```env
DATABASE_URL="file:./prod.db"
JWT_SECRET="your-very-strong-secret-key-min-32-chars"
JWT_EXPIRES_SEC=604800
PORT=3000

PUBLIC_BASE_URL=https://api.westler.com
ADMIN_ORIGIN=https://admin.westler.com
FRONTEND_ORIGIN=https://westler.com,https://www.westler.com

SEED_ADMIN_LOGIN=admin
SEED_ADMIN_PASSWORD=Change-This-Strong-Password-123!
```

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (first time only)
npm run db:seed

# Build the NestJS app
npm run build

# Quick test (Ctrl+C to stop)
npm run start:prod
```

> **Important:** Make sure the `uploads/` directory exists and is writable:
> ```bash
> mkdir -p uploads
> chmod 755 uploads
> ```

---

### 4. Frontend Setup

```bash
cd /var/www/westler/frontend

# Create production .env.local
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.westler.com
```

```bash
# Build Next.js for production
npm run build

# Quick test (Ctrl+C to stop)
PORT=3001 npm run start
```

---

### 5. Admin Panel Setup

The admin panel is a **static SPA** — build it and serve via Nginx directly.

```bash
cd /var/www/westler/admin

# Create production .env
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=https://api.westler.com
```

```bash
# Build static files
npm run build
# Output → /var/www/westler/admin/dist/
```

---

### 6. PM2 Process Manager

Create an **ecosystem file** at `/var/www/westler/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [
    {
      name: "westler-backend",
      cwd: "/var/www/westler/backend",
      script: "dist/src/main.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
      },
      // Auto-restart settings
      max_memory_restart: "512M",
      exp_backoff_restart_delay: 100,
    },
    {
      name: "westler-frontend",
      cwd: "/var/www/westler/frontend",
      script: "node_modules/.bin/next",
      args: "start --port 3001",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      max_memory_restart: "512M",
      exp_backoff_restart_delay: 100,
    },
  ],
};
```

```bash
cd /var/www/westler

# Start all services
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs

# Save PM2 process list & enable startup on boot
pm2 save
pm2 startup
# → Run the command that PM2 outputs (sudo env PATH=...)
```

---

### 7. Nginx Configuration

#### 7.1 Backend API — `api.westler.com`

```bash
sudo nano /etc/nginx/sites-available/westler-api
```

```nginx
server {
    listen 80;
    server_name api.westler.com;

    # Max upload size (adjust as needed)
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve uploaded files directly from Nginx for better performance
    location /uploads/ {
        alias /var/www/westler/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

#### 7.2 Frontend — `westler.com`

```bash
sudo nano /etc/nginx/sites-available/westler-frontend
```

```nginx
server {
    listen 80;
    server_name westler.com www.westler.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js static assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3001;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

#### 7.3 Admin Panel — `admin.westler.com`

```bash
sudo nano /etc/nginx/sites-available/westler-admin
```

```nginx
server {
    listen 80;
    server_name admin.westler.com;

    root /var/www/westler/admin/dist;
    index index.html;

    # SPA: redirect all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

#### 7.4 Enable Sites & Restart

```bash
# Enable all sites
sudo ln -s /etc/nginx/sites-available/westler-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/westler-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/westler-admin /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### 8. SSL with Certbot (Let's Encrypt)

```bash
# Obtain certificates for all domains
sudo certbot --nginx \
  -d api.westler.com \
  -d westler.com \
  -d www.westler.com \
  -d admin.westler.com

# Certbot will automatically:
# - Obtain SSL certificates
# - Update Nginx configs to listen on 443
# - Add HTTP → HTTPS redirect

# Verify auto-renewal
sudo certbot renew --dry-run
```

> After SSL is set up, update the backend `.env` to use `https://` in all URLs:
> ```env
> PUBLIC_BASE_URL=https://api.westler.com
> ADMIN_ORIGIN=https://admin.westler.com
> FRONTEND_ORIGIN=https://westler.com,https://www.westler.com
> ```
> Then restart: `pm2 restart all`

---

### 9. Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

> **Do NOT** expose ports `3000` or `3001` directly — Nginx proxies all traffic.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable               | Required | Description                                          |
| ---------------------- | -------- | ---------------------------------------------------- |
| `DATABASE_URL`         | ✅       | Prisma DB URL. For SQLite: `file:./prod.db`         |
| `JWT_SECRET`           | ✅       | Secret key for JWT signing (min 32 chars)            |
| `JWT_EXPIRES_SEC`      |          | Token TTL in seconds (default: `604800` = 7 days)   |
| `PORT`                 |          | API listening port (default: `3000`)                 |
| `PUBLIC_BASE_URL`      |          | Full URL prefix for uploaded files                   |
| `ADMIN_ORIGIN`         | ✅       | Allowed CORS origin for admin panel                  |
| `FRONTEND_ORIGIN`      | ✅       | Allowed CORS origin(s) for frontend                  |
| `SEED_ADMIN_LOGIN`     |          | Initial admin username (seed only)                   |
| `SEED_ADMIN_PASSWORD`  |          | Initial admin password (seed only)                   |

### Frontend (`frontend/.env.local`)

| Variable              | Required | Description                  |
| --------------------- | -------- | ---------------------------- |
| `NEXT_PUBLIC_API_URL`  | ✅       | Backend API base URL         |

### Admin (`admin/.env`)

| Variable       | Required | Description                            |
| -------------- | -------- | -------------------------------------- |
| `VITE_API_URL` | ✅       | Backend API base URL (baked at build)  |

---

## Useful Commands

```bash
# ── PM2 ──────────────────────────────────────────
pm2 status                    # Show process status
pm2 logs                      # Stream all logs
pm2 logs westler-backend      # Stream backend logs only
pm2 restart all               # Restart all services
pm2 restart westler-backend   # Restart backend only
pm2 reload all                # Zero-downtime reload
pm2 monit                     # Real-time monitoring

# ── Nginx ────────────────────────────────────────
sudo nginx -t                 # Test config syntax
sudo systemctl reload nginx   # Apply config changes
sudo systemctl status nginx   # Check Nginx status
sudo tail -f /var/log/nginx/error.log   # Error logs

# ── Prisma ───────────────────────────────────────
cd /var/www/westler/backend
npx prisma migrate deploy     # Apply pending migrations
npx prisma studio             # Web-based DB browser
npm run db:seed               # Re-run seed script

# ── Deployment (pull & rebuild) ──────────────────
cd /var/www/westler
git pull origin main

# Backend
cd backend && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build && cd ..

# Frontend
cd frontend && npm ci && npm run build && cd ..

# Admin
cd admin && npm ci && npm run build && cd ..

# Restart services
pm2 restart all
```

---

## Backup & Restore

### Database Backup (SQLite)

```bash
# Create backup
cp /var/www/westler/backend/prod.db /var/www/westler/backend/backups/prod-$(date +%Y%m%d-%H%M%S).db

# Automate with cron (daily at 2 AM)
crontab -e
# Add:
0 2 * * * cp /var/www/westler/backend/prod.db /var/www/westler/backend/backups/prod-$(date +\%Y\%m\%d-\%H\%M\%S).db
```

### Uploads Backup

```bash
# Compress and backup uploads
tar -czf /var/www/westler/backend/backups/uploads-$(date +%Y%m%d).tar.gz \
  /var/www/westler/backend/uploads/
```

### Restore

```bash
# Stop backend first
pm2 stop westler-backend

# Restore database
cp /var/www/westler/backend/backups/prod-20260430-020000.db /var/www/westler/backend/prod.db

# Restore uploads
tar -xzf /var/www/westler/backend/backups/uploads-20260430.tar.gz -C /

# Restart
pm2 start westler-backend
```

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
pm2 logs westler-backend --lines 50

# Verify .env file
cat /var/www/westler/backend/.env

# Test manually
cd /var/www/westler/backend
node dist/src/main.js
```

### Nginx returns 502 Bad Gateway

```bash
# Check if backend/frontend is running
pm2 status

# Check Nginx error log
sudo tail -20 /var/log/nginx/error.log

# Verify port binding
ss -tlnp | grep -E '3000|3001'
```

### Prisma migration issues

```bash
cd /var/www/westler/backend

# Check migration status
npx prisma migrate status

# Reset (⚠ deletes all data)
npx prisma migrate reset
```

### CORS errors in browser

Ensure these match your actual domains in `backend/.env`:

```env
ADMIN_ORIGIN=https://admin.westler.com
FRONTEND_ORIGIN=https://westler.com,https://www.westler.com
```

Then: `pm2 restart westler-backend`

### Uploads not showing

```bash
# Check directory permissions
ls -la /var/www/westler/backend/uploads/

# Fix permissions
sudo chown -R $USER:$USER /var/www/westler/backend/uploads/
chmod -R 755 /var/www/westler/backend/uploads/
```

---

## License

UNLICENSED — Private project.
