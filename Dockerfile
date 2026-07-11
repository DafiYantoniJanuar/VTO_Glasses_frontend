FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port 5173
EXPOSE 5173

# Start Vite development server
CMD ["npm", "run", "dev", "--", "--host"]
