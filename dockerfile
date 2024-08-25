# Use the official Node.js image with pnpm as a base image
FROM node:18.3.1-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN pnpm run build

# Expose port 3000 to the outside world
EXPOSE 3000

# Set environment variable for production (optional)
ENV NODE_ENV=production

# Command to run the application
CMD ["pnpm", "start"]