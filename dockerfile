FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["npm", "start"]