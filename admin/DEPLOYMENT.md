# Admin Panel Deployment Instructions (Traditional VPS)

## Overview
The admin panel has been converted from Cloudflare Workers to traditional Node.js deployment for use on a VPS.

## Prerequisites
- Node.js 18+ installed
- npm or yarn
- Access to your VPS via SSH
- Backend API running on port 5000

## Local Development

```bash
cd admin
npm install
npm run dev
```

The admin panel will be available at `http://localhost:8086`

## Building for Production

```bash
cd admin
npm run build
```

This creates a `dist/` folder with static files.

## Production Deployment on VPS

### Option 1: Serve with Nginx (Recommended)

1. **Build the admin panel locally:**
```bash
npm run build
```

2. **Upload the dist folder to your VPS:**
```bash
scp -r dist/* expert001@your-server:/var/www/agentika/admin/
```

3. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Admin panel
    location /admin {
        alias /var/www/agentika/admin;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Restart Nginx:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Build on the Server

1. **Upload the entire admin directory to the server:**
```bash
scp -r admin/ expert001@your-server:/var/www/agentika/
```

2. **SSH into the server:**
```bash
ssh expert001@your-server
cd /var/www/agentika/admin
```

3. **Install dependencies and build:**
```bash
npm install
npm run build
```

4. **Serve with a simple HTTP server (for testing):**
```bash
npx serve dist -l 8086
```

Or configure Nginx as shown in Option 1.

### Option 3: Serve with PM2 (Node.js)

1. **Install a simple static file server:**
```bash
npm install -g serve
```

2. **Start with PM2:**
```bash
pm2 serve /var/www/agentika/admin/dist 8086 --spa
pm2 save
pm2 startup
```

## Environment Variables

Create or update `.env` in the admin directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update to your actual backend URL:

```env
VITE_API_URL=https://your-domain.com/api
```

## Troubleshooting

### Build Errors
If you encounter permission errors on the server:
```bash
sudo chown -R expert001:expert001 /var/www/agentika/admin
```

### API Connection Issues
- Ensure backend is running on port 5000
- Check CORS configuration in backend `.env` file
- Verify `VITE_API_URL` is correct

### Route Issues (404 on refresh)
This is handled by Nginx's `try_files` directive or PM2's `--spa` flag.

## File Structure Changes Made

- **Removed:** Cloudflare Workers dependencies (`@cloudflare/vite-plugin`, `@tanstack/react-start`)
- **Removed:** `wrangler.jsonc` configuration
- **Added:** `index.html` entry point
- **Added:** `src/main.tsx` entry point
- **Updated:** `vite.config.ts` for traditional Node.js deployment
- **Updated:** `package.json` dependencies

## Security Notes

- Use HTTPS in production (Let's Encrypt recommended)
- Configure proper firewall rules
- Keep dependencies updated
- Use environment variables for sensitive data
