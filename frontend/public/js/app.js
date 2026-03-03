// app.js - Versión final con notificaciones centrales

const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
let compraData = null;

// Elementos del DOM
const app = document.getElementById('app');
const userInfo = document.getElementById('user-info');

// Función para mostrar notificaciones flotantes
function mostrarNotificacion(mensaje, tipo = 'error') {
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo === 'exito' ? 'exito' : ''}`;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Función para hacer fetch con autenticación
async function fetchWithAuth(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
    const response = await fetch(url, { ...options, headers });
    return response;
}

// Renderizar según estado de autenticación
function renderUserInfo() {
    if (usuario) {
        userInfo.innerHTML = `
            <span>Bienvenido, ${usuario.nombre}</span>
            <button class="btn" onclick="logout()">Cerrar sesión</button>
        `;
    } else {
        userInfo.innerHTML = `
            <button class="btn" onclick="showLogin()">Iniciar sesión</button>
            <button class="btn" onclick="showRegister()">Registrarse</button>
        `;
    }
}

// Cerrar sesión
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    token = null;
    usuario = null;
    renderUserInfo();
    loadPeliculas();
};

// Mostrar login
window.showLogin = function() {
    app.innerHTML = `
        <h2>Iniciar sesión</h2>
        <form id="login-form">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Contraseña" required>
            <button type="submit" class="btn">Ingresar</button>
        </form>
    `;
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
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
                renderUserInfo();
                loadPeliculas();
            } else {
                mostrarNotificacion('Datos incorrectos');
            }
        } catch (error) {
            mostrarNotificacion('Error de conexión');
        }
    });
};

// Mostrar registro
window.showRegister = function() {
    app.innerHTML = `
        <h2>Registro</h2>
        <form id="register-form">
            <input type="text" id="nombre" placeholder="Nombre" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Contraseña" required>
            <button type="submit" class="btn">Registrarse</button>
        </form>
    `;
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                mostrarNotificacion('Registro exitoso. Ahora inicia sesión.', 'exito');
                showLogin();
            } else {
                mostrarNotificacion('Error: ' + data.error);
            }
        } catch (error) {
            mostrarNotificacion('Error de conexión');
        }
    });
};

// Cargar películas (cartelera)
window.loadPeliculas = async function() {
    try {
        const res = await fetch(`${API_URL}/peliculas`);
        const peliculas = await res.json();
        renderPeliculas(peliculas);
    } catch (error) {
        mostrarNotificacion('Error al cargar películas');
        app.innerHTML = '<p>Error al cargar películas</p>';
    }
};

function renderPeliculas(peliculas) {
    if (peliculas.length === 0) {
        app.innerHTML = '<p>No hay películas en cartelera</p>';
        return;
    }

    let html = '<h2>Cartelera</h2><div class="peliculas-grid">';
    peliculas.forEach(p => {
        html += `
            <div class="pelicula-card" onclick="verFunciones(${p.id})">
                <img src="${p.posterUrl}" alt="${p.titulo}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/200x300?text=No+Image';">
                <div class="pelicula-info">
                    <h3>${p.titulo}</h3>
                    <p>Duración: ${p.duracion} min</p>
                    <p>Clasificación: ${p.clasificacion}</p>
                    <button class="btn">Ver horarios</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    app.innerHTML = html;
}

// Ver funciones de una película
window.verFunciones = async function(peliculaId) {
    try {
        const res = await fetch(`${API_URL}/funciones/pelicula/${peliculaId}`);
        const funciones = await res.json();
        renderFunciones(funciones, peliculaId);
    } catch (error) {
        mostrarNotificacion('Error al cargar funciones');
    }
};

function renderFunciones(funciones, peliculaId) {
    if (funciones.length === 0) {
        app.innerHTML = '<p>No hay funciones disponibles</p><button class="btn" onclick="loadPeliculas()">Volver</button>';
        return;
    }

    let html = '<h2>Selecciona un horario</h2><div class="funciones-lista">';
    funciones.forEach(f => {
        const fecha = new Date(f.fechaHora).toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        html += `
            <div class="funcion-card">
                <p><strong>${fecha}</strong></p>
                <p>Sala: ${f.sala.nombre} (Cap. ${f.sala.capacidad})</p>
                <p>Precio: S/ ${f.precioBase}</p>
                <button class="btn" onclick="verAsientos(${f.id})">Seleccionar asientos</button>
            </div>
        `;
    });
    html += '</div><button class="btn btn-secondary" onclick="loadPeliculas()">Volver</button>';
    app.innerHTML = html;
}

// Ver asientos de una función
window.verAsientos = async function(funcionId) {
    if (!token) {
        mostrarNotificacion('Debes iniciar sesión para comprar');
        showLogin();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/funciones/${funcionId}/asientos`);
        const asientos = await res.json();
        renderAsientos(asientos, funcionId);
    } catch (error) {
        mostrarNotificacion('Error al cargar asientos');
    }
};

function renderAsientos(asientos, funcionId) {
    const seleccionados = [];

    let html = `
        <h2>Selecciona tus asientos</h2>
        <div class="mapa-butacas" id="mapa-butacas">
            <div class="pantalla">PANTALLA</div>
    `;

    asientos.forEach(a => {
        const clase = a.ocupado ? 'ocupado' : '';
        html += `<div class="asiento ${clase}" data-id="${a.id}" data-coordenadas="${a.coordenadas}">${a.coordenadas}</div>`;
    });

    html += '</div>';

    // Leyenda
    html += `
        <div class="leyenda">
            <div class="leyenda-item">
                <div class="leyenda-color disponible"></div>
                <span>Disponible</span>
            </div>
            <div class="leyenda-item">
                <div class="leyenda-color seleccionado"></div>
                <span>Seleccionado</span>
            </div>
            <div class="leyenda-item">
                <div class="leyenda-color ocupado"></div>
                <span>Ocupado</span>
            </div>
        </div>
    `;

    html += '<p>Asientos seleccionados: <span id="seleccionados">0</span></p>';
    html += '<button class="btn" id="btn-comprar">Comprar</button>';
    html += '<button class="btn btn-secondary" onclick="loadPeliculas()">Cancelar</button>';

    app.innerHTML = html;

    // Agregar eventos a los asientos
    document.querySelectorAll('.asiento:not(.ocupado)').forEach(asiento => {
        asiento.addEventListener('click', () => {
            const id = asiento.dataset.id;
            const index = seleccionados.indexOf(id);
            if (index === -1) {
                seleccionados.push(id);
                asiento.classList.add('seleccionado');
            } else {
                seleccionados.splice(index, 1);
                asiento.classList.remove('seleccionado');
            }
            document.getElementById('seleccionados').textContent = seleccionados.length;
        });
    });

    // Evento comprar
    document.getElementById('btn-comprar').addEventListener('click', () => {
        if (seleccionados.length === 0) {
            mostrarNotificacion('Selecciona al menos un asiento');
            return;
        }
        compraData = {
            funcionId: funcionId,
            asientosIds: seleccionados.map(Number)
        };
        mostrarModalPago();
    });
}

// ==================== PRÓXIMOS ESTRENOS ====================
window.showProximosEstrenos = function() {
    const proximos = [
        {
            titulo: 'Avatar 3',
            fecha: '2026-12-18',
            descripcion: 'La tercera entrega de la épica saga de Pandora.',
            poster: 'https://picsum.photos/id/100/200/300'
        },
        {
            titulo: 'Spider-Man: Beyond the Spider-Verse',
            fecha: '2027-03-15',
            descripcion: 'Miles Morales regresa en una nueva aventura multiversal.',
            poster: 'https://picsum.photos/id/101/200/300'
        },
        {
            titulo: 'El Señor de los Anillos: La cacería de Gollum',
            fecha: '2026-09-10',
            descripcion: 'Una nueva historia en la Tierra Media.',
            poster: 'https://picsum.photos/id/102/200/300'
        }
    ];

    let html = '<h2>Próximos estrenos</h2><div class="peliculas-grid">';
    proximos.forEach(p => {
        html += `
            <div class="pelicula-card" style="cursor: default;">
                <img src="${p.poster}" alt="${p.titulo}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/200x300?text=No+Image';">
                <div class="pelicula-info">
                    <h3>${p.titulo}</h3>
                    <p><strong>Estreno:</strong> ${new Date(p.fecha).toLocaleDateString('es-ES')}</p>
                    <p>${p.descripcion}</p>
                </div>
            </div>
        `;
    });
    html += '</div><button class="btn btn-secondary" onclick="loadPeliculas()">Volver a cartelera</button>';
    app.innerHTML = html;
};

// ==================== MODAL DE PAGO ====================
function crearModal() {
    const modalHTML = `
        <div id="modal-pago" class="modal" style="display:none;">
            <div class="modal-content">
                <span class="close" onclick="cerrarModal()">&times;</span>
                <h2>💳 Método de pago</h2>
                <div class="metodos-pago" id="metodos-pago">
                    <button class="btn-metodo" onclick="mostrarFormulario('tarjeta')">
                        <span style="font-size:2rem;">💳</span>
                        Tarjeta
                    </button>
                    <button class="btn-metodo" onclick="mostrarFormulario('transferencia')">
                        <span style="font-size:2rem;">🏦</span>
                        Transferencia
                    </button>
                    <button class="btn-metodo" onclick="mostrarFormulario('billetera')">
                        <span style="font-size:2rem;">📱</span>
                        Billetera
                    </button>
                </div>
                <div id="form-pago-container"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.cerrarModal = function() {
    document.getElementById('modal-pago').style.display = 'none';
};

window.mostrarFormulario = function(metodo) {
    document.querySelectorAll('.btn-metodo').forEach(btn => btn.classList.remove('active'));
    const botones = document.querySelectorAll('.btn-metodo');
    if (metodo === 'tarjeta') botones[0].classList.add('active');
    else if (metodo === 'transferencia') botones[1].classList.add('active');
    else if (metodo === 'billetera') botones[2].classList.add('active');

    const container = document.getElementById('form-pago-container');
    let html = '';

    if (metodo === 'tarjeta') {
        html = `
            <form id="form-tarjeta">
                <h3>💳 Pago con tarjeta</h3>
                <input type="text" placeholder="Número de tarjeta" required>
                <input type="text" placeholder="Nombre del titular" required>
                <div style="display: flex; gap: 1rem;">
                    <input type="text" placeholder="MM/AA" required>
                    <input type="text" placeholder="CVV" required>
                </div>
                <button type="submit" class="btn">Pagar ahora</button>
            </form>
        `;
    } else if (metodo === 'transferencia') {
        html = `
            <form id="form-transferencia">
                <h3>🏦 Transferencia bancaria</h3>
                <div class="datos-transferencia">
                    <p><strong>Banco:</strong> Banco de Crédito</p>
                    <p><strong>Cuenta:</strong> 123-4567890-123</p>
                    <p><strong>CCI:</strong> 12345678901234567890</p>
                </div>
                <label>Número de operación:</label>
                <input type="text" placeholder="Ej: 123456" required>
                <button type="submit" class="btn">Confirmar pago</button>
            </form>
        `;
    } else if (metodo === 'billetera') {
        html = `
            <form id="form-billetera">
                <h3>📱 Billetera digital</h3>
                <select required>
                    <option value="">Selecciona una billetera</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="tunki">Tunki</option>
                </select>
                <input type="text" placeholder="Número de celular" required>
                <button type="submit" class="btn">Pagar</button>
            </form>
        `;
    }

    container.innerHTML = html;

    const form = container.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!compraData) return;

            try {
                const res = await fetchWithAuth(`${API_URL}/compras`, {
                    method: 'POST',
                    body: JSON.stringify({
                        usuarioId: usuario.id,
                        funcionId: compraData.funcionId,
                        asientosIds: compraData.asientosIds,
                        metodoPago: metodo
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    mostrarNotificacion(`¡Compra exitosa! ID: ${data.compraId}`, 'exito');
                    cerrarModal();
                    loadPeliculas();
                } else {
                    mostrarNotificacion('Error: ' + data.error);
                }
            } catch (error) {
                mostrarNotificacion('Error al procesar la compra');
            }
        });
    }
};

function mostrarModalPago() {
    document.getElementById('modal-pago').style.display = 'flex';
    mostrarFormulario('tarjeta');
}

// ==================== INICIALIZACIÓN ====================
crearModal();
renderUserInfo();
loadPeliculas();