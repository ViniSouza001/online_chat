const header = document.querySelector(".load");
let userCount = 0;
const userCountString = document.querySelector('.userCount');
const headerCouting = document.querySelector('.header');
const threePoints = document.querySelector(".activeConfig")
const config = document.querySelector(".config");

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

// connect to server
let websocket;

// other elements
let typingTimeout;
const colors = [
  "cadetblue",
  "darkgoldenrod",
  "cornflowerblue",
  "darkkhaki",
  "hotpink",
  "gold",
];

const user = { id: "", name: "", color: "" };

const inTesting = () => {
  alert("Function still in test");
}

const connect = () => {
  websocket = new WebSocket("wss://chat-backend-nb82.onrender.com");

  // for testing
  // websocket = new WebSocket("ws://localhost:8080");
  
  websocket.onmessage = processMessage;

    websocket.onopen = () => {
      header.style.display = "none";
      headerCouting.style.display = "flex"
      // userCountString.style.display = "block";
      const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: "entrou no chat",
        systemMessage: true,
        enteredUser: true
      };
      websocket.send(JSON.stringify(message));
    };

    // send message when left of page
    window.onbeforeunload = () => {
      const exitMessage = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: "saiu do chat",
        systemMessage: true,
        enteredUser: false
      };
      websocket.send(JSON.stringify(exitMessage));
    }
}

const displayMessage = (data) => {
  const { userId, userName, userColor, content, systemMessage, enteredUser } = data;

  if(!content.trim()) {
    console.log(content)
    alert("A mensagem não pode estar vazia");
    return;
  }
  // if userId is equal my id, message is mine, else is from another person
  if(systemMessage) {
    message = createMessageSystem(content, userName, userColor);

    // if a user entered add one more to count, else it is subtracted
    enteredUser ? userCount++ : userCount--

    userCountString.textContent = `Usuários conectados: ${userCount}`
  } else if (userId == user.id) {
    message = createMessageSelfElement(content)
  } else {
    message = createMessageOtherElement(content, userName, userColor);
  }

  chatMessages.appendChild(message);

  playAudio();

  scrollScreen();
};


// system to know when someone is typing
const handleTyping = () => {
  websocket.send(
    JSON.stringify({
      userId: user.id,
      userName: user.name,
      typing: true // show that user is typing
    })
  );

  // remove the indication of typing after 3 seconds of inativity
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    websocket.send(
      JSON.stringify({
        userId: user.id,
        userName: user.name,
        typing: false // show the user stoped of typing
      })
    );
  }, 1000);
}

chatInput.addEventListener("input", handleTyping);

const typingIndicator = document.createElement("div");
typingIndicator.classList.add("typing-indicator");

const processMessage = (event) => {
  const data = JSON.parse(event.data);

  if(data.typing !== undefined) {
    if(data.typing) {
      typingIndicator.innerText = `${data.userName} está digitando...`
      chatMessages.appendChild(typingIndicator);
    } else {
      typingIndicator.innerText = ``
      typingIndicator.remove();

    }
  } else {
    displayMessage(data);
  }
}

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
  const randomNumber = Math.floor(Math.random() * 2);
  audios[randomNumber].play();
}

const handleLogin = (event) => {
  event.preventDefault();

  user.id = crypto.randomUUID();
  user.name = loginInput.value;
  user.color = getRandomColor();

  header.style.display = "flex";
  connect();

  login.style.display = "none";
  chat.style.display = "flex";
};

const sendMessage = (event) => {
  event.preventDefault();

  // remove the alert that the user is typing
  websocket.send(
    JSON.stringify({
      userId: user.id,
      userName: user.name,
      typing: false // show that user is typing
    })
  );

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


// frontend

// config
const activeConfig = () => {
  config.classList.toggle("configActive");
}