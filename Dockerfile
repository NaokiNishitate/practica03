FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run dev

EXPOSE 3000
CMD ["npm", "start"]
