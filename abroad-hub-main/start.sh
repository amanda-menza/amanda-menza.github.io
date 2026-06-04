#!/bin/bash
source venv/bin/activate
gunicorn --workers 3 --bind unix:/run/abroad-hub/app.sock backend.wsgi:application
