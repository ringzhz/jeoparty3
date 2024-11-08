FROM node:14-alpine

# RUN apk add --no-cache curl

WORKDIR /app

COPY ./package*.json /app
COPY ./src /app/src
COPY ./public /app/public


RUN npm i
# ENTRYPOINT ["sh"]
# RUN npm run build
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "dev"]