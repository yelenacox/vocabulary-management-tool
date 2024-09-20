# Stage 1: Build the React app
FROM node:18-alpine as build


# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

ARG ENV_FILE
# Build the React app

RUN if [[ "$ENV_FILE" = "dev" ]]; then RUN npm run build-dev; fi
# Stage 2: Serve the React app
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf 

# Copy the build output to the Nginx html directory
COPY --from=build ./dist /usr/share/nginx/html

# Expose port 5000
EXPOSE 5000


# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

