const { WebSocketServer } = require("ws");
const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());

const dotenv = require("dotenv");
dotenv.config();

const wss = new WebSocketServer({
  port: process.env.PORT || 8080,
});

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data) => {
    // envia uma mensagem para todos os clientes
    wss.clients.forEach((client) => {
      client.send(data);
    });
  });
  console.log("cliente connected");
});

console.log("server running");
