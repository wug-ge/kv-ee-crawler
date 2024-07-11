FROM node:22

COPY . /src
WORKDIR /src
RUN npm i

CMD ["npm", "run", "start"]
