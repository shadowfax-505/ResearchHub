FROM node:20-alpine

WORKDIR /app

COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web ./

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "dev"]
