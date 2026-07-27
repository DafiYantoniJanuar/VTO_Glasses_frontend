FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

EXPOSE 5173

# Run dev server binding host to 0.0.0.0 for docker access
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]
