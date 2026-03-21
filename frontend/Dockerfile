FROM node:18

WORKDIR /app

COPY . .

RUN npm install -g http-server

EXPOSE 5000

CMD ["http-server", ".", "-p", "5000", "--cors"]