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

# Auto-install packages and start Vite development server
CMD ["sh", "-c", "npm install && npm run dev -- --host"]
