FROM node:22

WORKDIR /app

ENV NODE_OPTIONS="--trace-warnings"

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "server"]
