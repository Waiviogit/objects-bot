FROM node:13

RUN mkdir -p /home/oleh/objects-bot/
WORKDIR /home/oleh/objects-bot/

COPY . /home/oleh/objects-bot/
RUN npm install

EXPOSE 9000

CMD ["node", "app.js"]
