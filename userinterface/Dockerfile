# Base Image
FROM node:16
# Working directory inside container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json files to cache dependencies
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy all files
COPY . .
# Run the listener app
CMD ["npm", "start"]