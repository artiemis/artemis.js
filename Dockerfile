FROM oven/bun:1-alpine

RUN apk add --no-cache python3 py3-pip git

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY . .

CMD ["bun", "start"]