FROM node:lts-alpine as build-stage
WORKDIR /app

RUN wget https://github.com/gohugoio/hugo/releases/download/v0.80.0/hugo_0.80.0_Linux-64bit.tar.gz && \
    tar -xvzf hugo_0.80.0_Linux-64bit.tar.gz && \
    mv hugo /usr/local/bin/hugo && \
    rm -rf hugo_0.80.0_Linux-64bit.tar.gz
COPY src/package*.json ./
RUN npm install
COPY src/ .
COPY ./config.js src/assets/scripts/config.js
ENV VITE_API_URL=/api
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
ADD nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
