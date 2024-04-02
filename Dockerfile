FROM node:20.12-alpine

COPY . /app
WORKDIR /app

RUN npm i

EXPOSE 3000
CMD [ "npm", "start" ]
