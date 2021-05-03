FROM node:14.16.0-alpine3.10

WORKDIR /

ADD package.json ./
ADD yarn.lock ./

RUN yarn install
ADD . .

STOPSIGNAL SIGINT

CMD yarn start