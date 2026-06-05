# Deployment Guide for Abroad Hub

This guide explains how to deploy **Abroad Hub** on a Linux server. It covers:

- Server Preparation
- Project Setup
- Web Server Configuration (Nginx)
- SSL Setup with Let’s Encrypt
- Process Management & Firewall Configuration
- Final Testing and Troubleshooting

> **Note:** Modify any commands, file paths, or configuration details as necessary for your specific project.

---

## 1. Server Preparation

### a. Choose Your Linux Distribution

For this guide, we’ll assume you’re using Ubuntu Server (20.04 LTS or later).

### b. Connect to Your Server

Connect via SSH:

```bash
ssh username@your_server_ip
```

### c. Update Server

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Cloning the Repository

You should already be in the directory for your user. If not, cd to your user directory or wherever you'd like to clone the repository.

```bash
git clone https://github.com/Abroadhub/abroad-hub.git
cd abroad-hub
```

## 3. Install frontend dependencies

```bash
apt install npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

cd frontend
npm install
npm run build
```

## 4. Setup virtual environment and install backend dependencies

### a. Setup virtual environment

```bash
cd ../backend
sudo apt install python3.10-venv
python3 -m venv venv
source venv/bin/activate
```

### b. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### c. Setup environment variables

Create a .env file (or set environment variables as needed) for your Django settings:

```bash
nano .env
```

Fill in the necessary environment variables, such as:

```
# --- DATABASE CONFIGURATION ---
DB_NAME=                   # Name of the PostgreSQL database
DB_USER=                   # Username for the database
DB_HOST=localhost          # Host where the database is running (usually localhost)
DB_PORT=5432               # Default PostgreSQL port
DB_PWD=                    # Password for the database user

# --- DJANGO STATIC FILES & HOSTING ---
STATIC_ROOT=               # Directory where Django collects static files (used in production)
ALLOWED_HOSTS=             # Comma-separated list of allowed hostnames (e.g., yourdomain.com,www.yourdomain.com)

# --- SECURITY ---
SECRET_KEY=''              # Django secret key (keep this private and secure)

# --- FRONTEND CONFIG ---
NEXT_PUBLIC_API_URL=       # Publicly exposed backend API URL (used in frontend apps like Next.js)

# --- ENVIRONMENT ---
NODE_ENV=production        # Can be 'development' or 'production' — affects build/optimizations

# --- SERVER CONFIG ---
IP_ADDRESS=                # Public IP address of your server (optional, used in deployment or logging)

# --- SINGLE SIGN-ON (SSO) CONFIG ---
SSO_CLIENT_ID=""           # Client ID for your SSO provider
SSO_REDIRECT_URL=""        # Redirect URL after successful login
SSO_AUTH_URL=""            # SSO authorization endpoint
SSO_TOKEN_URL=""           # SSO token exchange endpoint
SSO_SECRET=""              # Client secret for your SSO app
SSO_USER_INFO_URL=""       # Endpoint to fetch user information after login

# --- BACKUP CONFIGURATION ---
LOCAL_BACKUP_DIR=/path/to/abroad-hub/backups/     # Local folder to store backups
REMOTE_USER=remote_server_username                # SSH user for the remote server
REMOTE_HOST=remote_server_hostname                # Hostname or IP of the remote server
REMOTE_BACKUP_DIR=/path/to/remote/backups/        # Remote folder to store backups

# --- EMAIL CONFIG (FOR BACKUP ALERTS) ---
MAILCHIMP_API_KEY=your_mandrill_api_key           # Mandrill (Mailchimp) API key for sending alert emails
FROM_EMAIL=[email]@duke.edu                       # Sender's email address
TO_EMAIL=[email]@duke.edu                         # Recipient's email address
SUBJECT=Abroad-Hub Backup Alert                   # Subject line for backup alert emails

# --- MEDIA FILES ---
MEDIA_SOURCE_DIR="/path/to/abroad-hub/backend/media"  # Directory containing uploaded user files/media

# --- BASE URL FOR APPLICATION ---
BASE_URL=""                 # Root URL of your site (e.g., https://abroad-hub.duke.edu)



```

### d. Setup PostgreSQL database

```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql
CREATE DATABASE your_database_name;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_user;
```

### e. Collect static files and apply migrations

```bash
python manage.py collectstatic --noinput
python manage.py makemigrations
python manage.py migrate
```

### f. Test the Application with Gunicorn

Run Gunicorn to verify your Django backend works:

```bash
sudo apt install gunicorn

# Create the directory if it doesn't exist
sudo mkdir -p /run/abroad-hub
# Set the appropriate ownership (replace user:group with your values)
sudo chown jc870:jc870 /run/abroad-hub

python -m gunicorn --workers 3 --bind unix:/run/abroad-hub/app.sock backend.wsgi:application
```

## 5. Configure Nginx

### a. Install Nginx

```bash
sudo apt install nginx
```

### b. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/abroad-hub
```

```nginx
server {
    server_name abroad.colab.duke.edu;

    # Static files for Django
    location /static/ {
        autoindex on;
        autoindex_exact_size off;
        alias /home/jc870/abroad-hub/backend/static/;
    }

    # Static files for Next.js
    location /_next/static {
        alias /home/jc870/abroad-hub/frontend/.next/static;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Media files       
    location /media/ {
        alias /home/jc870/abroad-hub/backend/media/;
        autoindex off;
        types {
            application/pdf pdf;
        }
        add_header Content-Disposition "inline";
        add_header Access-Control-Allow-Origin "*";
        try_files $uri $uri/ =404;
    }

    # Django API endpoints
    location /api {
        proxy_pass http://unix:/run/abroad-hub/app.sock;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django admin interface
    location /admin/ {
        proxy_pass http://unix:/run/abroad-hub/app.sock;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

    # Main location block for Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Remove these lines that were causing the loop
        # root /home/jc870/abroad-hub/frontend/.next;
        # try_files $uri $uri.html $uri/ /_next/static/chunks/pages$uri.js /index.html;
    }

    # Keep your existing SSL configuration
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/abroad.colab.duke.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/abroad.colab.duke.edu/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Keep your existing HTTP to HTTPS redirect
server {
    if ($host = abroad.colab.duke.edu) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name abroad.colab.duke.edu;
    return 404;
}


```

Note: Replace your_domain.com with your actual domain name and adjust all file paths according to your server setup.

## 6. SSL Setup with Let's Encrypt

### a. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### b. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your_domain.com
```

## 7. Start the Application

### a. Start Next.js Frontend

Install PM2 to manage the Next.js process:

```bash
npm install -g pm2
cd frontend
pm2 start npm --name "abroad-hub-frontend" -- start
```

### b. Create Systemd Service for Gunicorn

```bash
sudo nano /etc/systemd/system/abroad-hub.service
```

```ini
[Unit]
Description=Abroad Hub Gunicorn Daemon
After=network.target

[Service]
User=your_username
Group=your_username
WorkingDirectory=/path/to/abroad-hub/backend
Environment="PATH=/path/to/abroad-hub/backend/venv/bin"
ExecStart=/path/to/abroad-hub/backend/venv/bin/python -m gunicorn \
          --workers 3 \
          --bind unix:/run/abroad-hub/app.sock \
          backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

## 8. Reconfigure pm2 to use ecosystem.config.js

### a. Configure PM2 for Process Management

Create a PM2 ecosystem config file in your project root:

```bash
# Navigate to project root
cd abroad-hub

# Create ecosystem config
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 10000 // Wait 10 seconds between restarts
    },
    {
      name: 'backend',
      script: './start.sh',
      cwd: './backend',
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 10000 // Wait 10 seconds between restarts
    }
  ]
}
EOL
```

Create the `start.sh` script for the backend:

Create start script

```bash
cat > start.sh << EOL
#!/bin/bash
source venv/bin/activate
python -m gunicorn --workers 3 --bind unix:/run/abroad-hub/app.sock backend.wsgi:application
EOL
```

Make the script executable

```bash
chmod +x start.sh
```

### b. Start and Enable Services

```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 startup systemd
pm2 save
```

## 9. Initial Data Setup

There are two ways to set up the initial data for the application:

### Option A: Creating Default Data (Fresh Installation)

#### a. Create Admin User

First create a superuser using manage.py:

```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

Fill out the prompts to create a superuser and make sure to save the credentials.

#### b. Create Admin User via Admin Portal

Go to the admin portal at `https://your_domain.com/admin/`

Login with the superuser credentials you just created.

Click on the "Users" link in the left sidebar under authentication and authorization.

Click on the "Add User" button.

Fill out the prompts, making sure that the username is "admin".

Click on the "Save" button.

Now to link that to an AppUser:

1. Click on the "App Users" link in the left sidebar
2. Click on the "Add AppUser" button
3. Fill out the prompts, making sure that:
   - The username is tied to the "admin" username used in the previous step
   - The user roles are "Administrator" and "Faculty"
   - The display name is "Administrator"
4. Click on the "Save" button

### Option B: Setting Up with Initial Test Data

If you want to populate the system with sample data:

```bash
# Run the provided script for generating test data
cd backend
source venv/bin/activate
python manage.py initialize_default_data
```

## 10. Disaster Recovery Procedure

This section covers how to restore the system from a backup in case of system failure.

### a. Prerequisites

- Access to the backup files (either from local backup directory or remote backup server)
- A fresh installation of the application (follow steps 1-8 above)

### b. Retrieving the Latest Backup

#### If using the backup system described in the Backup Admin Guide:

```bash
# List available backups on the remote server
ssh REMOTE_USER@REMOTE_HOST "ls -lh /path/to/backups"

# Copy the desired db backup to the local server
scp REMOTE_USER@REMOTE_HOST:/path/to/backups/db_backup_YYYY-MM-DD_HH-MM-SS.sql.gz /tmp/

# Copy the desired media backup to the local server
scp REMOTE_USER@REMOTE_HOST:/path/to/backups/media_backup_YYYY-MM-DD_HH-MM-SS.sql.gz /tmp/
```

Replace REMOTE_USER and REMOTE_HOST with appropriate values, and select the most recent backup file or the specific backup you want to restore.

### c. Preparing the Database

First, ensure the PostgreSQL is installed and running:

```bash
sudo systemctl status postgresql
```

If the database already exists (from a fresh installation), you'll need to drop it:

```bash
sudo -u postgres psql -c "DROP DATABASE your_database_name;"
sudo -u postgres psql -c "CREATE DATABASE your_database_name;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_database_user;"
```

### d. Restoring from DB Backup

Decompress and restore the database:

```bash
# Decompress the backup file
gunzip -c /tmp/db_backup_YYYY-MM-DD_HH-MM-SS.sql.gz > /tmp/db_restore.sql

# Restore the database
sudo -u postgres psql your_database_name < /tmp/db_restore.sql
```

### e. Verify the Restoration

Check if the restoration was successful:

```bash
cd backend
source venv/bin/activate
python manage.py dbshell

# Run some queries to verify data integrity
SELECT COUNT(*) FROM abroadhub_appuser;
SELECT COUNT(*) FROM abroadhub_applications;
\q
```

### f. Restore Media Files

If your media files were backed up separately, restore them as well:

```bash
# First, make sure the target directory exists locally
mkdir -p ~/abroad-hub/backend/media

# Extract the backup file to a temporary location
mkdir -p /tmp/media_restore
tar -xzf media_backup_2025-03-18_17-01-33.tar.gz -C /tmp/media_restore

# Remove existing content in the target directory (be careful with this command!)
rm -rf ~/abroad-hub/backend/media/*

# Copy the extracted files to the target directory
cp -r /tmp/media_restore/* ~/abroad-hub/backend/media/

# Clean up the temporary directory
rm -rf /tmp/media_restore
```

### g. Restart the Application

Restart all services to ensure they use the restored data:

```bash
pm2 restart all
sudo systemctl restart abroad-hub
sudo systemctl restart nginx
```

### h. Verify Full Functionality

1. Visit your domain in a web browser
2. Try to log in with a known user account from the restored data
3. Check if key functionalities are working correctly

## 11. Final Testing and Troubleshooting

### a. Common Issues and Solutions

#### Application Not Starting

Check the logs for errors:

```bash
pm2 logs
sudo journalctl -u abroad-hub
sudo journalctl -u nginx
```

#### Database Connection Issues

Verify database connection settings in `.env` file and ensure PostgreSQL is running:

```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

#### Permission Issues

Check file permissions and ownership:

```bash
sudo chown -R your_username:your_username /path/to/abroad-hub
sudo chmod -R 755 /path/to/abroad-hub
sudo chmod -R 777 /path/to/abroad-hub/backend/media
```

### b. Setting Up Automated Backups

To ensure you have backups for future disaster recovery needs, set up the automated backup system as described in the Backup Admin Guide:

```bash
# Clone backup scripts if not already included in the repository
cd /path/to/abroad-hub/backups
chmod +x setup_backup_cron.sh
./setup_backup_cron.sh
```

Make sure to check the backup logs regularly and test the backup restoration process periodically to ensure your disaster recovery plan works as expected.
