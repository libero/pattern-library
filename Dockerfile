FROM node:8.12.0-jessie
WORKDIR /patterns-core

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
RUN node_modules/.bin/gulp
