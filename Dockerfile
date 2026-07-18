FROM node:20-alpine

WORKDIR /app

COPY api/package.json api/package-lock.json ./
RUN npm ci --only=production

COPY api ./api

COPY .env.example ./

EXPOSE 3000

WORKDIR /app/api
CMD ["node", "server.js"]
