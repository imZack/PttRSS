FROM node:alpine

MAINTAINER shih@yulun.me

WORKDIR /src

ADD . .

RUN npm install

EXPOSE 8000

CMD ["node", "server.js"]
