FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ------------------------------

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY .env .env
COPY wait-for.sh /wait-for.sh

RUN apk add --no-cache dos2unix && \
    dos2unix /wait-for.sh && \
    chmod +x /wait-for.sh

CMD ["/wait-for.sh", "mysql", "node", "dist/main.js"]
