FROM node:19
WORKDIR /usr/src/app
COPY ./package.json .
RUN npm i
COPY ./*.mjs ./
COPY ./routers ./routers
COPY ./data-layer ./data-layer
CMD npm start