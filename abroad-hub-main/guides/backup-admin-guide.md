# Abroad-Hub Backup System Administrator Guide

This document provides comprehensive instructions for configuring, maintaining, and restoring the Abroad-Hub database backup system. This guide is intended for system administrators who need to manage the backup infrastructure.

## Table of Contents

1. [System Overview](#system-overview)
2. [Initial Setup](#initial-setup)
3. [Configuration](#configuration)
4. [Backup Schedule and Retention](#backup-schedule-and-retention)
5. [Monitoring and Notifications](#monitoring-and-notifications)
6. [Restoring from Backup](#restoring-from-backup)
7. [Testing Backup Validity](#testing-backup-validity)
8. [Troubleshooting](#troubleshooting)

## System Overview

The Abroad-Hub backup system implements an automated PostgreSQL database backup solution that:

- Creates daily backups
- Stores backups on a separate system
- Implements a staggered retention policy
- Notifies administrators of success or failure
- Secures access with separate credentials

## Initial Setup

### Prerequisites

- Access to the application server
- PostgreSQL client tools installed (`pg_dump`, `psql`)
- SSH access to the remote backup server
- Email notifications service (Mandrill API)

### Installation Steps

1. **Clone the repository** (if not already done):

   ```bash
   git clone https://github.com/Abroadhub/abroad-hub.git
   cd abroad-hub
   ```

2. **Set up environment variables**:
   Create or edit the `.env` file in the application root directory to include the following variables:

   ```
   DB_USER=your_database_user
   DB_PWD=your_database_password
   DB_NAME=your_database_name
   LOCAL_BACKUP_DIR=/path/to/abroad-hub/backups/
   REMOTE_USER=remote_server_username
   REMOTE_HOST=remote_server_hostname
   REMOTE_BACKUP_DIR=/path/to/remote/backups/
   API_KEY=your_mandrill_api_key
   FROM_EMAIL=[email]@duke.edu
   TO_EMAIL=[email]@duke.edu
   SUBJECT=Abroad-Hub Backup Alert
   ```

3. **Set up SSH key authentication** to the remote backup server:

   ```bash
   # Generate SSH key if you don't have one
   ssh-keygen -t rsa -b 4096

   # Copy your public key to the remote server
   ssh-copy-id REMOTE_USER@REMOTE_HOST
   ```

4. **Install the backup script and cron job**:

   ```bash
   # Navigate to the backup directory
   cd backups

   # Make the setup script executable
   chmod +x setup_backup_cron.sh

   # Run the setup script
   ./setup_backup_cron.sh
   ```

## Configuration

### Environment Variables

The backup system uses these key environment variables:

| Variable          | Description                                      |
| ----------------- | ------------------------------------------------ |
| DB_USER           | PostgreSQL database username                     |
| DB_PWD            | PostgreSQL database password                     |
| DB_NAME           | Database name to backup                          |
| LOCAL_BACKUP_DIR  | Temporary directory for storing backups          |
| REMOTE_USER       | Username for the remote backup server            |
| REMOTE_HOST       | Hostname/IP of the remote backup server          |
| REMOTE_BACKUP_DIR | Directory on remote server to store backups      |
| API_KEY           | Mandrill API key for sending email notifications |
| FROM_EMAIL        | Email address notifications will be sent from    |
| TO_EMAIL          | Email address to receive notifications           |
| SUBJECT           | Subject line for notification emails             |

### Customizing the Backup Script

The main backup script (`db_backup.sh`) can be modified to adjust backup parameters:

- **Change backup time**: Edit `crontab.config` to adjust when backups run
- **Modify retention periods**: Edit the time periods in the backup script
- **Change notification settings**: Modify the email settings

## Backup Schedule and Retention

### Schedule

By default, backups run daily at 12:00 PM. To modify this schedule, edit the `crontab.config` file and reinstall the crontab:

```bash
crontab < crontab.config
```

### Retention Policy

The system implements a staggered retention policy:

- **Daily backups**: Last 7 days
- **Weekly backups**: Last 4 weeks (created on Sundays)
- **Monthly backups**: Last 12 months (created on the 1st of each month)

## Monitoring and Notifications

### Email Notifications

The system sends email notifications for:

- Successful backups
- Failed backup attempts
- Failed backup transfers

### Log File

All backup operations are logged on local server at:

```
/home/user/backups/backup.log
```

Review this file regularly to monitor the backup system.

## Restoring DB from Backup

To restore the database from a backup:

1. **List available backups** on the remote server:

   ```bash
   ssh username@remote-host "ls -lh /path/to/backups/"
   ```

2. **Copy the desired backup** to the local server:

   ```bash
   scp username@remote-host:/home/user/backups/db_backup_YYYY-MM-DD_HH-MM-SS.sql.gz .
   ```

3. **Decompress the backup file**:

   ```bash
   gunzip db_backup_YYYY-MM-DD_HH-MM-SS.sql.gz
   ```

4. **Restore the database**:

   ```bash
   # For a complete restore (will drop and recreate the database)
   psql -U username -h localhost -c "DROP DATABASE IF EXISTS your_database_name;"
   psql -U username -h localhost -c "CREATE DATABASE your_database_name;"
   psql -U username -h localhost -d your_database_name < db_backup_YYYY-MM-DD_HH-MM-SS.sql

   # For a partial restore or to restore to a different database
   psql -U username -h localhost -d target_database < db_backup_YYYY-MM-DD_HH-MM-SS.sql
   ```

## Restoring Media from Backup

To restore the media from a backup:

1. **List available media** on the remote server:

   ```bash
   ssh username@remote-host "ls -lh /path/to/backups/"
   ```

2. **Copy the desired backup** to the local server:

   ```bash
   scp username@remote-host:/home/user/backups/media_backup_YYYY-MM-DD_HH-MM-SS.tar.gz .
   ```

3. **Make sure the target directory exists** on local server:

   ```bash
   mkdir -p ~/abroad-hub/backend/media
   ```

4. **Extract the backup file** to a temporary location:

   ```bash
   mkdir -p /tmp/media_restore
   tar -xzf media_backup_2025-03-18_17-01-33.tar.gz -C /tmp/media_restore
   ```

5. **Remove existing content** from local media, if any:

   ```bash
   rm -rf ~/abroad-hub/backend/media/*
   ```

6. **Copy extracted files** to target directory:

   ```bash
   cp -r /tmp/media_restore/* ~/abroad-hub/backend/media/
   ```

7. **Clean up** the temporary directory:
   ```bash
   rm -rf /tmp/media_restore
   ```

## Testing DB Backup Validity

To verify a backup is valid and can be successfully restored:

1. **Create a test database**:

   ```bash
   psql -U username -h localhost -c "CREATE DATABASE test_restore;"
   ```

2. **Restore the backup to the test database**:

   ```bash
   gunzip -c db_backup_YYYY-MM-DD_HH-MM-SS.sql.gz | psql -U username -h localhost -d test_restore
   ```

3. **Verify the data integrity**:

   ```bash
   # Connect to the test database
   psql -U username -h localhost -d test_restore

   # Run queries to verify key tables have data
   SELECT COUNT(*) FROM abroadhub_appuser;
   SELECT COUNT(*) FROM abroadhub_applications;
   # Add other verification queries
   ```

4. **Clean up the test database**:
   ```bash
   psql -U username -h localhost -c "DROP DATABASE test_restore;"
   ```

## Troubleshooting

### Common Issues

1. **Backup fails to create**:

   - Verify database credentials in the `.env` file
   - Check PostgreSQL server is running
   - Ensure sufficient disk space for the backup

2. **Transfer to remote server fails**:

   - Verify SSH key authentication is working
   - Check network connectivity to the remote server
   - Ensure remote server has sufficient disk space

3. **Email notifications not received**:
   - Verify Mandrill API key is correct
   - Check email addresses are valid
   - Review any API errors in the log file
