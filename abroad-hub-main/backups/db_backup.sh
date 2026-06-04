#!/bin/bash

# source /home/jc870/abroad-hub/backend/.env
source /Users/amandamenza/Downloads/458/abroad-hub/.env

# Ensure backup directory exists locally
mkdir -p "$LOCAL_BACKUP_DIR"
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')
echo "Uploading to remote path: $REMOTE_USER@$REMOTE_HOST:$REMOTE_BACKUP_DIR"

# Backup database and compress
DB_BACKUP_FILE="$LOCAL_BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
export PGPASSWORD="$DB_PWD"
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" | gzip > "$DB_BACKUP_FILE"

# Verify database backup success
if [ $? -eq 0 ]; then
    echo "Database backup created successfully: $DB_BACKUP_FILE"
else
    echo "Database backup failed!" | curl -X POST https://mandrillapp.com/api/1.0/messages/send.json \
    --data-urlencode "key=$MAILCHIMP_API_KEY" \
    --data-urlencode "message[from_email]=$FROM_EMAIL" \
    --data-urlencode "message[to][0][email]=$TO_EMAIL" \
    --data-urlencode "message[subject]=$SUBJECT" \
    --data-urlencode "message[text]=Database backup failed."
    exit 1
fi

# Backup media folder
MEDIA_BACKUP_FILE="$LOCAL_BACKUP_DIR/media_backup_$TIMESTAMP.tar.gz"
echo "Creating media folder backup..."
tar -czf "$MEDIA_BACKUP_FILE" -C "$MEDIA_SOURCE_DIR" .

# Transfer backups to remote server
rsync -avz -e "ssh -o StrictHostKeyChecking=no" "$DB_BACKUP_FILE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_BACKUP_DIR/"
rsync -avz -e "ssh -o StrictHostKeyChecking=no" "$MEDIA_BACKUP_FILE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_BACKUP_DIR/"

# Check if transfer was successful
if [ $? -eq 0 ]; then
    echo "Backups successfully transferred to $REMOTE_HOST"
else
    # Clean up local backups
    rm -f "$DB_BACKUP_FILE"
    rm -f "$MEDIA_BACKUP_FILE"
    echo "Backup transfer failed!" | curl -X POST https://mandrillapp.com/api/1.0/messages/send.json \
    --data-urlencode "key=$MAILCHIMP_API_KEY" \
    --data-urlencode "message[from_email]=$FROM_EMAIL" \
    --data-urlencode "message[to][0][email]=$TO_EMAIL" \
    --data-urlencode "message[subject]=$SUBJECT" \
    --data-urlencode "message[text]=Backup transfer to remote host failed."
    exit 1
fi
# Get just the base filename for use on remote server
DB_BACKUP_BASENAME=$(basename "$DB_BACKUP_FILE")
MEDIA_BACKUP_BASENAME=$(basename "$MEDIA_BACKUP_FILE")
echo "base name $DB_BACKUP_BASENAME, file name $DB_BACKUP_FILE"
# Apply retention policy on remote server
ssh "$REMOTE_USER@$REMOTE_HOST" << EOF
    cd "$REMOTE_BACKUP_DIR"
    
    # Remove old daily backups beyond 7 days
    find . -name "db_backup_*.sql.gz" -mtime +7 -delete
    find . -name "media_backup_*.tar.gz" -mtime +7 -delete
    
    # Keep weekly backups (every Sunday)
    if [ "\$(date +%u)" -eq 7 ]; then
        cp "$DB_BACKUP_BASENAME" "weekly_db_backup_\$(date +'%Y-%m-%d').sql.gz"
        cp "$MEDIA_BACKUP_BASENAME" "weekly_media_backup_\$(date +'%Y-%m-%d').tar.gz"
        find . -name "weekly_db_backup_*.sql.gz" -mtime +28 -delete
        find . -name "weekly_media_backup_*.tar.gz" -mtime +28 -delete
    fi
    
    # Keep monthly backups (first of the month)
    if [ "\$(date +%d)" -eq 01 ]; then
        cp "$DB_BACKUP_BASENAME" "monthly_db_backup_\$(date +'%Y-%m').sql.gz"
        cp "$MEDIA_BACKUP_BASENAME" "monthly_media_backup_\$(date +'%Y-%m').tar.gz"
        find . -name "monthly_db_backup_*.sql.gz" -mtime +365 -delete
        find . -name "monthly_media_backup_*.tar.gz" -mtime +365 -delete
    fi
EOF

# Notify success
echo "Backup completed successfully" | curl -X POST https://mandrillapp.com/api/1.0/messages/send.json \
--data-urlencode "key=$MAILCHIMP_API_KEY" \
--data-urlencode "message[from_email]=$FROM_EMAIL" \
--data-urlencode "message[to][0][email]=$TO_EMAIL" \
--data-urlencode "message[subject]=$SUBJECT" \
--data-urlencode "message[text]=Backup completed successfully. Timestamp: $TIMESTAMP"

# Clean up local backups
rm "$DB_BACKUP_FILE"
rm "$MEDIA_BACKUP_FILE"
