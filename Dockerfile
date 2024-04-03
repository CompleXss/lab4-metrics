FROM node:20.12-slim

COPY . /app
WORKDIR /app

RUN apt-get update
RUN apt-get install lm-sensors -y
RUN npm i

EXPOSE 3000
CMD [ "npm", "start" ]
