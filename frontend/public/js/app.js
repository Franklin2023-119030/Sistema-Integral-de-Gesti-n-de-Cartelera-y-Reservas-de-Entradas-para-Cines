// Configuración
const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

// Elementos del DOM
const app = document.getElementById('app');
const userInfo = document.getElementById('user-info');

// Función para renderizar la vista según autenticación
function render() {
    if (token && usuario) {
        renderHome();
    } else {
        renderAuth();
    }
}

// Vista de autenticación (registro/login)
function renderAuth() {
    app.innerHTML = `
        <h2>Bienvenido al Cine</h2>
        <div id="auth">
            <h3>Registro</h3>
            <input type="text" id="reg-nombre" placeholder="Nombre" />
            <input type="email" id="reg-email" placeholder="Email" />
            <input type="password" id="reg-password" placeholder="Contraseña" />
            <button id="btn-register">Registrarse</button>
            <hr />
            <h3>Iniciar Sesión</h3>
            <input type="email" id="login-email" placeholder="Email" />
            <input type="password" id="login-password" placeholder="Contraseña" />
            <button id="btn-login">Iniciar Sesión</button>
        </div>
    `;

    document.getElementById('btn-register').addEventListener('click', register);
    document.getElementById('btn-login').addEventListener('click', login);
}

// Registro
async function register() {
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();
    if (res.ok) {
        alert('Registro exitoso, ahora inicia sesión');
    } else {
        alert('Error: ' + data.error);
    }
}

// Login
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
        token = data.token;
        usuario = data.usuario;
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        renderHome();
    } else {
        alert('Error: ' + data.error);
    }
}

// Vista principal (después de login)
function renderHome() {
    app.innerHTML = `
        <h2>Hola, ${usuario.nombre}</h2>
        <button id="btn-logout">Cerrar sesión</button>
        <div id="cartelera"></div>
    `;
    document.getElementById('btn-logout').addEventListener('click', logout);
    cargarCartelera();
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    token = null;
    usuario = null;
    renderAuth();
}

// Cargar películas
async function cargarCartelera() {
    const res = await fetch(`${API_URL}/peliculas`);
    const peliculas = await res.json();
    const carteleraDiv = document.getElementById('cartelera');
    carteleraDiv.innerHTML = '<h3>Películas en cartelera</h3>';
    peliculas.forEach(p => {
        carteleraDiv.innerHTML += `
            <div class="pelicula-card">
                <img src="${p.posterUrl}" alt="${p.titulo}" style="width:100px;">
                <h4>${p.titulo}</h4>
                <p>Duración: ${p.duracion} min</p>
                <button onclick="verFunciones(${p.id})">Ver horarios</button>
            </div>
        `;
    });
}

// Hacer disponible la función globalmente
window.verFunciones = async (peliculaId) => {
    // Aquí implementaremos la vista de funciones
    alert('Función aún no implementada');
};

// Iniciar la aplicación
render();