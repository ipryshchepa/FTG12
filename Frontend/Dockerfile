# Build stage - using Debian-based image for better SSL support
FROM node:20 AS build
WORKDIR /app

# Ensure devDependencies are installed
ENV NODE_ENV=development

# Copy package files
COPY package.json package-lock.json ./

# Configure npm for corporate SSL environments and install dependencies
RUN npm config set strict-ssl false && \
    npm config set registry http://registry.npmjs.org/ && \
    npm install --include=dev

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npx vite build

# Runtime stage
FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html

# Remove default nginx content
RUN rm -rf ./*

# Copy built application from build stage
COPY --from=build /app/dist .

# Copy nginx configuration for SPA routing
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # SPA routing - redirect all routes to index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
