FROM node:20-alpine

# Set working directory
WORKDIR /app

# Expose port 5173
EXPOSE 5173

# npm install runs at startup (handled by bind mount + CMD)
CMD ["sh", "-c", "npm install && npm run dev"]
