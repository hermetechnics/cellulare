FROM node:10.20.0-alpine3.10

WORKDIR /src
COPY . /src
RUN npm install

CMD npm start
