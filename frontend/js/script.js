const header = document.querySelector(".load");
let userCount = 0;
let editableMessageId = "";
const userCountString = document.querySelector('.userCount');
const headerCouting = document.querySelector('.header');
const config = document.querySelector(".config");

// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const uploadBtn = chat.querySelector(".uploadBtn");
const fileInput = chat.querySelector("#fileInput");
const chatMessages = chat.querySelector(".chat__messages");

// config elements
const alterName = document.querySelector(".alterName");
const inputAlterName = document.querySelector(".inputAlterName");
const forms = document.querySelectorAll(".form");
const formEdition = document.querySelector(".formEdition");
const inputFormEdition = formEdition.querySelector(".login__input");
const cancel = document.querySelector(".btnCancel");
const idMessage = "";

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
      const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: "entrou no chat",
        systemMessage: true,
        enteredUser: "joined"
      };
      websocket.send(JSON.stringify(message));
    };

    websocket.onclose = () => {
      let countdown = 5;

      const alertBox = document.createElement("div");
      alertBox.id = "reconnect-alert";

      const countdownText = document.createElement("span");
      countdownText.innerText = `Conexão perdida. Tentando reconectar em ${countdown}s...`
      alertBox.appendChild(countdownText);

      document.body.appendChild(alertBox);

      const interval = setInterval(() => {
        countdown--;
        if(countdown <= 0) {
          clearInterval(interval);
          alertBox.remove();
        } else {
          countdownText.innerText = `Conexão perdida. Tentando reconectar em ${countdown}s...`
        }
      }, 1000);
    }
}

const displayMessage = (data) => {
  const { userId,
    userName,
    userColor,
    content,
    isNewName,
    systemMessage,
    userCount,
    contentEdition,
    idMessage,
    editedMessage,
    type} = data;

 if(editedMessage) {
    const message = document.getElementById(idMessage);
    const contentSpan = message.querySelector(".message-content");
    if(contentSpan) contentSpan.textContent = contentEdition;
    return;
  }

  if(type == "image") {
    const div = document.createElement("div");
    div.classList.add("message--image");
    
    const img = document.createElement("img");
    img.src = data.content;
    img.alt = "Imagem enviada";

    const caption = document.createElement("span");
    const h1 = document.createElement('h1');
    h1.classList.add("message--sender");
    h1.style.color = userColor;
    h1.innerHTML = userName
    caption.appendChild(h1);

    div.appendChild(caption);
    div.appendChild(img);
    chatMessages.appendChild(div);
    scrollScreen();
    playAudio();
    return;
  }

  if(!content.trim()) {
    alert("A mensagem não pode estar vazia");
    return;
  }
  // if userId is equal my id, message is mine, else is from another person
  if(systemMessage) {
    message = createMessageSystem(content, userName, userColor, isNewName);

    // atualiza contador se for recebido
    if(userCount !== undefined) {
      userCountString.textContent = `Usuários conectados: ${userCount}`;
    }

  } else if (userId == user.id) {
    message = createMessageSelfElement(content, idMessage);
  } else {
    message = createMessageOtherElement(content, userName, userColor, idMessage);
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

const handleDisplay = (element) => {
  element.classList.toggle("display--none");
}

const createMessageSelfElement = (content, idMessage) => {
  const div = document.createElement("div");
  const editIcon = document.createElement("img");
  const messageText = document.createElement("span");
  messageText.classList.add("message-content");
  messageText.innerHTML = content;

  div.classList.add("message--self");
  if(idMessage) {div.id = `${idMessage}`;};

  // edition icon
  editIcon.src = "./images/edit.png";
  editIcon.alt = "Editar";
  editIcon.classList.add("edition");
  editIcon.classList.add("display--none");

  div.addEventListener("mouseover", () => {
    editIcon.classList.remove("display--none");
  });

  div.addEventListener("mouseleave", () => {
    editIcon.classList.add("display--none");
  });

  editIcon.addEventListener("click", () => {
    handleDisplay(formEdition);
    formEdition.querySelector("input").value = content;

    const currentContent = div.querySelector(".message-content").textContent;
    inputFormEdition.value = currentContent;

    editableMessageId = idMessage;
  });
  
  messageText.innerText = content;
  div.appendChild(editIcon);
  div.appendChild(messageText);

  return div;
};

const createMessageOtherElement = (content, sender, senderColor, idMessage) => {
  const div = document.createElement("div");
  const h1 = document.createElement("h1");
  const messageText = document.createElement("span");

  messageText.classList.add("message-content");
  messageText.textContent = content;

  div.id = `${idMessage}`;
  div.classList.add("message--other");
  h1.classList.add("message--sender");
  h1.style.color = senderColor;

  div.appendChild(h1);

  h1.innerHTML = sender;
  div.appendChild(messageText);

  return div;
};

const createMessageSystem = (content, userName, userColor, newName) => {
  const div = document.createElement("div");
  const span = document.createElement("span");
  div.classList.add("message--system");
  div.appendChild(span);
  span.style.color = userColor;
  span.innerHTML = userName;

  if (newName) {
    const alteredName = document.createElement("span");
    alteredName.style.color = userColor;
    alteredName.innerHTML = "&nbsp;" + newName[1];
    
    div.innerHTML += "&nbsp;" + content
    div.appendChild(alteredName)
  } else {
    div.innerHTML += "&nbsp;" + content; // give a empty space
  }

  return div;
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

  chatInput.focus();
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
    systemMessage: false,
    idMessage: crypto.randomUUID()
  };

  websocket.send(JSON.stringify(message));

  chatInput.value = "";
  chatInput.focus();
};

// other forms

const handleAlterName = (e) => {
  e.preventDefault();
  const newName = inputAlterName.value;
  if(!inputAlterName.value.trim()) {
    alert("Você deve digitar um nome!");
    return;
  }
  const data = {
    userId: user.id,
    userName: user.name,
    userColor: user.color,
    content: `mudou o nome para`,
    isNewName: [true, newName],
    systemMessage: true,
    alterName: true
  };
  websocket.send(JSON.stringify(data));
  user.name = newName;

  inputAlterName.value = "";
  handleDisplay(alterName);
  activeConfig();
  return;
}

const editMessage = (event) => {
  event.preventDefault();
  const newMessage = formEdition.querySelector("input").value;

  const data = {
    "contentEdition": newMessage,
    "idMessage": editableMessageId,
    "editedMessage": true
  }
  websocket.send(JSON.stringify(data));

  handleDisplay(formEdition);
  return;
}

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
chatInput.addEventListener("paste", (event) => {
  const items = event.clipboardData.items;
  console.log(items[0].type)
  for(let i = 0; i < items.length; i++) {
    const item = items[i];

    if(item.type.startsWith("image/")) {
      const file = item.getAsFile();

      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result;
        const data = {
          userId: user.id,
          useName: user.name,
          userColor: user.color,
          content: base64Image,
          type: "image"
        };
        websocket.send(JSON.stringify(data));
      };
      reader.readAsDataURL(file);
      event.preventDefault();
      return;
    }
  }
});
uploadBtn.addEventListener("click", () => {fileInput.click();});
formEdition.addEventListener("submit", editMessage);
alterName.addEventListener("submit", handleAlterName);

forms.forEach((f) => {
  handleDisplay(f);
});

// functions

const activeConfig = () => {
  config.classList.toggle("configActive");
}

const reload = () => {
  window.location.reload();
}

// image selector

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0]; // list of archives on <input type="file"/>
  if(!file) return; // if not choosed a file, exit

  const reader = new FileReader();
  reader.onload = () => {
    const base64Image = reader.result;
    const data = {
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      content: base64Image,
      type: "image"
    };

    websocket.send(JSON.stringify(data));
    fileInput.value = ""; // clean input value after send to backend
  };

  reader.readAsDataURL(file);

});