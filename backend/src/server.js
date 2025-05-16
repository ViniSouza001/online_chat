// server.js
const { WebSocketServer } = require("ws");
const cors = require("cors");
const express = require("express");

const app = express();
app.use(cors());

require("dotenv").config();

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

let userCount = 0;

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (raw) => {
    const data = JSON.parse(raw.toString());

    // Controla entrada e saída de usuários
    if (data.systemMessage && data.enteredUser) {
      if (data.enteredUser === "joined") {
        userCount++;
        ws.userData = data; // associa usuário ao socket
      } else if (data.enteredUser === "left") {
        userCount = Math.max(0, userCount - 1);
      }

      // Atualiza contador na própria mensagem
      data.userCount = userCount;
    }

    // Controla status de digitação
    if (data.typing !== undefined) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1 && client !== ws) {
          client.send(JSON.stringify({
            userId: data.userId,
            userName: data.userName,
            typing: data.typing,
            idMessage: data.idMessage
          }));
        }
      });
      return;
    }

    // Envia mensagem para todos os usuários conectados
    const jsonMessage = JSON.stringify(data);
    console.log(jsonMessage);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(jsonMessage);
      }
    });
  });

  ws.on("close", () => {
    if (ws.userData) {
      userCount = Math.max(0, userCount - 1);
      const leaveMessage = {
        userId: ws.userData.userId,
        userName: ws.userData.userName,
        userColor: ws.userData.userColor,
        content: "saiu do chat",
        systemMessage: true,
        enteredUser: "left",
        userCount
      };

      const msg = JSON.stringify(leaveMessage);
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(msg);
        }
      });
    }
  });
});

console.log("server running on port " + PORT);
