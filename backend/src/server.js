const { WebSocketServer } = require("ws");
const cors = require("cors");
const express = require("express");
const app = express();
const userCount = 0;

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
    const parsedData = JSON.parse(data.toString());
    if(parsedData.typing !== undefined) {
      wss.clients.forEach((client) => {
        if(client.readyState === 1 && client !== ws) {
          client.send(
            JSON.stringify({
              userId: parsedData.userId,
              userName: parsedData.userName,
              typing: parsedData.typing
            })
          );
        }
      });
    } else {
      // envia uma mensagem para todos os clientes
      wss.clients.forEach((client) => {
        if(client.readyState === 1) { 
          client.send(data.toString());
        }
      });
      ws.userData - JSON.parse(data.toString())
    };
  });

  ws.on("close", () => {
    if(ws.userData) {
      const exitMessage = {
        userId: ws.userData.userId,
        userName: ws.userData.userName,
        userColor: ws.userData.userColor,
        content: "saiu do chat",
        systemMessage: true,
      }

      wss.clients.forEach((client) => {
        if(client.readyState === 1) {
          client.send(JSON.stringify(exitMessage));
        }
      })
    }
  })
});

console.log("server running on port " + PORT);
