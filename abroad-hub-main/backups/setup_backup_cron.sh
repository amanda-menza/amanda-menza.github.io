#!/bin/bash
# Script to set up the database backup cron job

# Make it executable with chmod +x setup_backup_cron.sh
# Run it with ./setup_backup_cron.sh

# Set path variables
REPO_DIR="/home/jc870/abroad-hub"
BACKUP_DIR="${REPO_DIR}/backups"
SCRIPT_PATH="${BACKUP_DIR}/db_backup.sh"
LOG_DIR="/home/jc870/abroad-hub/backups"
CRONTAB_CONFIG="${BACKUP_DIR}/crontab.config"

# Display what we're doing
echo "Setting up database backup cron job..."

# Ensure the backup script is executable
if [ -f "$SCRIPT_PATH" ]; then
    chmod +x "$SCRIPT_PATH"
    echo "✅ Made backup script executable"
else
    echo "❌ Error: Backup script not found at $SCRIPT_PATH"
    exit 1
fi

# Ensure the log directory exists
mkdir -p "$LOG_DIR"
echo "✅ Created log directory at $LOG_DIR"

# Verify the crontab config exists
if [ ! -f "$CRONTAB_CONFIG" ]; then
    echo "❌ Error: Crontab configuration not found at $CRONTAB_CONFIG"
    exit 1
fi

# Install the crontab
crontab < "$CRONTAB_CONFIG"

# Verify installation
if crontab -l | grep -q "db_backup.sh"; then
    echo "✅ Crontab successfully installed"
else
    echo "❌ Error: Crontab installation failed"
    exit 1
fi

echo "Setup complete. Database backups will run daily at 12:00 PM."
echo "Logs will be written to: $LOG_DIR/backup.log"
