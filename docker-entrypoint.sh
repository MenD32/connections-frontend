#!/bin/sh

# Default API host if not provided
export CONNECTIONS_API_HOST=${CONNECTIONS_API_HOST:-localhost:8000}

# Create runtime config file that can be loaded by the frontend
cat > /usr/share/nginx/html/config.js << EOL
window.ENV = {
  CONNECTIONS_API_HOST: "${CONNECTIONS_API_HOST}"
};
EOL

# Start nginx
exec nginx -g "daemon off;"
