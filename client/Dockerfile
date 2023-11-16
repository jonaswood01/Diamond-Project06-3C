FROM node:20-alpine3.16

# Copy essential node & npm files to the container for initialization
COPY ./package.json /app/client/package.json
COPY ./yarn.lock /app/client/yarn.lock
COPY ./index.html /app/client/index.html
COPY ./vite.config.js /app/client/vite.config.js

# Set the working directory to /app/client
WORKDIR /app/client/

# Install the dependencies inside container
RUN yarn --pure-lockfile --force && \
    yarn install --check-files
    

# Copy the rest of the files to the container
COPY ./src /app/client/src
COPY ./public /app/client/public

RUN PUBLIC_URL=/client yarn build

# Allow other containers to mount to build directory
VOLUME /app/client/build
