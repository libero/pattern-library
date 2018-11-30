#
# Stage: Composer install
#
FROM composer:1.7.3 as composer

RUN mkdir public source
COPY core/ core/
COPY config/ config/
COPY composer.json \
    composer.lock \
    ./

RUN composer --no-interaction install --ignore-platform-reqs --classmap-authoritative --no-suggest --prefer-dist



#
# Stage: Compile assets using Gulp
#
FROM node:10.12.0-slim AS gulp

WORKDIR /app

COPY package.json \
    package-lock.json \
    ./

RUN npm install

COPY .stylelintignore \
    .stylelintrc \
    gulpfile.js \
    ./
COPY libero-config/ libero-config/
COPY test/ test/
COPY source/ source/

RUN node_modules/.bin/gulp assemble



#
# Stage: Generate pattern library
#
FROM php:7.2.12-cli-alpine AS build

WORKDIR /app

COPY config/ config/
COPY core/ core/
COPY --from=composer /app/public/ public/
COPY --from=composer /app/vendor/ vendor/
COPY --from=gulp /app/source/ source/

RUN php core/console --generate



#
# Stage: Serve pattern library
#
FROM nginx:1.15.7-alpine AS ui

COPY --from=build /app/public/ /usr/share/nginx/html/
