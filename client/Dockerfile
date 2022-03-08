FROM node:lts-alpine as builder
WORKDIR /app

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache make gcc g++
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

COPY ./package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# this does nothing locally, but a cloud provider can use this to configure a load balancer
EXPOSE 80
COPY --from=builder /app/build /usr/share/nginx/html