# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy lock files and package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve stage
FROM nginxinc/nginx-unprivileged:alpine

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx HTML folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 for Cloud Run
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
