# Use the official Node.js 20 Alpine image for a lightweight, secure container base
FROM node:20-alpine

# Set the node environment to production for optimized performance
ENV NODE_ENV=production

# Define the working directory inside the container
WORKDIR /usr/src/app

# Copy application package files
COPY package*.json ./

# Install only production dependencies securely and cleanly
RUN npm ci --only=production

# Copy the rest of the application files (using .dockerignore to skip node_modules etc.)
COPY . .

# Expose the application port
EXPOSE 3000

# Run the app as a non-root user for improved security
USER node

# Command to run the application
CMD ["node", "server.js"]
