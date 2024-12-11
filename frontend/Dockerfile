# Build stage
FROM node:16 as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && \
    npm install --save-dev @babel/plugin-proposal-private-property-in-object && \
    npm install -g react-scripts@5.0.1 && \
    npm install chart.js@4.4.1 react-chartjs-2@5.2.0 reactflow@11.10.1 @mui/icons-material@5.11.16 @mui/material@5.11.16 @emotion/react@11.11.1 @emotion/styled@11.11.0

# Copy source code
COPY . .

# Set development environment
ENV NODE_ENV=development
ENV PATH /app/node_modules/.bin:$PATH
ENV REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_WS_URL=ws://localhost:8000/ws

# Expose port
EXPOSE 3001

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3001/ || exit 1

# Start the application with host network mode for better development experience
CMD ["npm", "start"]
