FROM node:13.8.0-alpine3.11

EXPOSE 5000

WORKDIR /usr/app

COPY ./package.json .

RUN npm install

COPY . .

RUN chmod +x ./shell/start.sh

CMD ./shell/start.sh