FROM node:22-bookworm-slim
WORKDIR /app/api
COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev
COPY api ./
COPY database /app/database
EXPOSE 3000
CMD ["npm", "start"]
