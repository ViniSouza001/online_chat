const { WebSocketServer } = require("ws");
const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 8080
const wss = new WebSocketServer({
  port: PORT,
});

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data) => {
    // envia uma mensagem para todos os clientes
    wss.clients.forEach((client) => {
      client.send(data.toString());
    });
  });
});

console.log("server running on port " + PORT);
