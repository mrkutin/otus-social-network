FROM node:19
WORKDIR /usr/src/app
COPY ./package.json .
RUN npm i
COPY ./* ./
#COPY ./*.mjs ./
#COPY ./routers ./
#COPY ./data-layer ./
CMD npm start