FROM htetlinmaung/startupenv

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

CMD [ "npm", "start" ]