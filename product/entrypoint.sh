#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
node dist/src/db/migrate.js

# Start the application
echo "Starting the application..."
exec node dist/src/server.js