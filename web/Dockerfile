FROM node:22-bookworm-slim
WORKDIR /app
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web ./
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3001
CMD ["npm", "run", "dev"]
