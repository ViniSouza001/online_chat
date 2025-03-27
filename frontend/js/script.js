// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

// sounds
const audio1 = new Audio('../audio/sound_chat1.mp3');
const audio2 = new Audio('../audio/sound_chat2.mp3');

const colors = [
  "cadetblue",
  "darkgoldenrod",
  "cornflowerblue",
  "darkkhaki",
  "hotpink",
  "gold",
];

const user = { id: "", name: "", color: "" };

let websocket;

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

const createMessageSelfElement = (content) => {
  const div = document.createElement("div");
  div.classList.add("message--self");
  div.innerHTML = content;

  return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
  const div = document.createElement("div");
  const span = document.createElement("span");

  div.classList.add("message--other");
  span.classList.add("message--sender");
  span.style.color = senderColor;

  div.appendChild(span);

  span.innerHTML = sender;
  div.innerHTML += content;

  return div;
};

const createMessageSystem = (content, userName, userColor) => {
  const div = document.createElement("div");
  const span = document.createElement("span");

  div.classList.add("message--system");
  div.appendChild(span);
  span.style.color = userColor;

  span.innerHTML = userName;
  div.innerHTML += "&nbsp;" + content; // give a empty space

  return div
}

const scrollScreen = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

const playAudio = () => {
  const audios = [audio1, audio2];
  const randomNumber = Math.floor(Math.random() * 2)
  audios[randomNumber].play();
}

const processMessage = ({ data }) => {
  const { userId, userName, userColor, content, systemMessage } = JSON.parse(data);

  // if userId is equal my id, message is mine, else is from another person
  if(systemMessage) {
    message = createMessageSystem(content, userName, userColor)
  } else if (userId == user.id) {
    message = createMessageSelfElement(content)
  } else {
    message = createMessageOtherElement(content, userName, userColor);
  }

  chatMessages.appendChild(message);

  playAudio();

  scrollScreen();
};

const stablishWebSocketConnection = () => {
  websocket = new WebSocket("wss://chat-backend-nb82.onrender.com");
  websocket.onmessage = processMessage;

    websocket.onopen = () => {
      const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: "entrou no chat",
        systemMessage: true
      };
      websocket.send(JSON.stringify(message));
    };

    
    websocket.onclose = () => {
      const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: "saiu",
        systemMessage: true
      }
      websocket.send(JSON.stringify(message));
      websocket.onmessage = processMessage;
    }
}

const handleLogin = (event) => {
  event.preventDefault();

  user.id = crypto.randomUUID();
  user.name = loginInput.value;
  user.color = getRandomColor();
  stablishWebSocketConnection()

  login.style.display = "none";
  chat.style.display = "flex";

  websocket.onclose = () => {
    const message = {
      userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: "saiu",
        systemMessage: true
    }
    websocket.send(JSON.stringify(message));
  }
};

const sendMessage = (event) => {
  event.preventDefault();

  const message = {
    userId: user.id,
    userName: user.name,
    userColor: user.color,
    content: chatInput.value,
    systemMessage: false
  };

  websocket.send(JSON.stringify(message));

  chatInput.value = "";
  chatInput.focus();
};

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
