// === SUBSTITUA PELOS SEUS DADOS DO FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyDOXhnHyCnrdyXW6sBBgEDpjmi0u8jieXU",
  authDomain : "my-chat-aff19.firebaseapp.com" , 
  databaseURL : "https://meu-chat-aff19-default-rtdb.firebaseio.com" , 
  projectId : "meu-chat-aff19" , 
  storageBucket: "meu-chat-aff19.firebasestorage.app",
  messagingSenderId: "710560450350",
  appId: "1:710560450350:web:ac43f97433bd648b571cbf",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const loginSection = document.getElementById("login-section");
const chatSection = document.getElementById("chat-section");
const loginForm = document.getElementById("login-form");
const chatForm = document.getElementById("chat-form");
const messagesContainer = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");

let user = { name: "", color: "" };
let chatAtivo = false;
const colors = ["#e67e22", "#2ecc71", "#3498db", "#9b59b6", "#f1c40f", "#e74c3c"];

const displayMessage = (data) => {
    const div = document.createElement("div");
    div.classList.add("msg");
    div.classList.add(data.sender === user.name ? "msg-self" : "msg-other");
    div.innerHTML = `<span class="sender" style="color: ${data.color}">${data.sender}</span>${data.message}`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
};

// --- LOGICA DE LOGIN COM VERIFICAÇÃO DE NOME ---
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nomeDigitado = document.getElementById("username").value.trim();
    
    if (!nomeDigitado) return;

    // 1. Verificar se o nome já existe na pasta 'usuarios_online'
    const snapshot = await database.ref(`usuarios_online/${nomeDigitado}`).get();

    if (snapshot.exists()) {
        // Se o nome já existir, avisa o usuário e não deixa entrar
        alert("Este nome já está em uso por outra pessoa conectada. Escolha outro!");
        return;
    }

    // 2. Se o nome estiver livre, configuramos o usuário
    user.name = nomeDigitado;
    user.color = colors[Math.floor(Math.random() * colors.length)];

    // 3. Marcar como ONLINE e configurar para APAGAR ao sair
    const userRef = database.ref(`usuarios_online/${user.name}`);
    
    // Define que ele está online agora
    userRef.set(true);
    
    // COMANDO MÁGICO: Se o usuário fechar a aba, o Firebase apaga o nome dele automaticamente
    userRef.onDisconnect().remove();

    // 4. Inicia o Chat
    loginSection.style.display = "none";
    chatSection.style.display = "flex";
    chatAtivo = true;
    const agora = Date.now();

    database.ref("mensagens")
        .orderByChild("timestamp")
        .startAt(agora)
        .on("child_added", (snap) => {
            if (chatAtivo) displayMessage(snap.val());
        });
});

// ENVIO
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = chatInput.value.trim();
    if (!texto) return;

    database.ref("mensagens").push({
        sender: user.name,
        color: user.color,
        message: texto,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    chatInput.value = "";
});