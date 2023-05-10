from node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY app/package*.json ./
RUN npm install

# Bundle app source
COPY app/ .

RUN npm run build

CMD [ "npx", "run", "list" ]
