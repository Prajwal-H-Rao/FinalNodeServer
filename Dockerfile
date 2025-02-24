FROM node:alpine

# Install ffmpeg in the container using apk
RUN apk update && apk add --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]
