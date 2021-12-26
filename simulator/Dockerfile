# Base Image
FROM node:16-alpine
# Working directory inside container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json files to cache dependencies
COPY package*.json ./
# Install dependencies
RUN npm ci --only=production
# Copy all files
COPY . .
# Exposing the port
#EXPOSE 3000
# Run the listener app
CMD ["node", "simulator.js", "1"]