FROM node:18

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/* && which ffmpeg

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

EXPOSE 3000

# Start the application
CMD [ "node", "index.js" ]
