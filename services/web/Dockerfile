FROM node:19
WORKDIR /usr/src/app
COPY ./package.json .
RUN npm i
COPY ./*.mjs ./
COPY ./routers ./routers
COPY ./data-layer ./data-layer
COPY ./middlewares ./middlewares
COPY ./public ./public
CMD npm start