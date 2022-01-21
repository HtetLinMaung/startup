FROM node:lts-alpine3.14

RUN apk add openrc
RUN apk add docker
RUN service docker start

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

CMD [ "npm", "start" ]