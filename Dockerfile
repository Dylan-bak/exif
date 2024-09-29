# First stage: build the app
FROM node:16-alpine AS build

WORKDIR /usr/src/app

EXPOSE 3000

COPY ./.next/standalone ./

CMD "node" "./packages/exif/server.js"