FROM node:16-bullseye as build-stage
WORKDIR /app

# Install required dependencies
RUN apt-get install -y git gcc g++

# Install Hugo Extended version and make it executable
RUN wget https://github.com/gohugoio/hugo/releases/download/v0.119.0/hugo_extended_0.119.0_linux-64bit.tar.gz && \
    tar -xzf hugo_extended_0.119.0_linux-64bit.tar.gz && \
    mv hugo /usr/bin/ && \
    rm -rf hugo_extended_0.119.0_linux-64bit.tar.gz && /usr/bin/hugo version

COPY src/package*.json ./
RUN npm install
COPY src/ .
COPY ./config.js src/assets/scripts/config.js

COPY src/package*.json ./
RUN npm install
COPY src/ .
COPY ./config.js src/assets/scripts/config.js

# algma coisa no build do hugo depende do git e não fica feliz com submodulos
RUN rm -rf .git && git init . && \
    git config --global user.email "docker@build.local" && \
    git config --global user.name "Docker Build" && \
    git add . && \
    git commit -m "Initial commit"

RUN npm run build-ci

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/public /usr/share/nginx/html
ADD nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
