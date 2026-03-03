// app.js - Versión final con modal de pagos

const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
let compraData = null; // Almacena datos de la compra en curso

// Elementos del DOM
const app = document.getElementById('app');
const userInfo = document.getElementById('user-info');

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
    showHome();
};

// Mostrar inicio
window.showHome = function() {
    app.innerHTML = `
        <h2>Bienvenido al cine</h2>
        <button class="btn" onclick="loadPeliculas()">Ver cartelera</button>
    `;
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
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión');
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
                alert('Registro exitoso. Ahora inicia sesión.');
                showLogin();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
};

// Cargar películas
window.loadPeliculas = async function() {
    try {
        const res = await fetch(`${API_URL}/peliculas`);
        const peliculas = await res.json();
        renderPeliculas(peliculas);
    } catch (error) {
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
                <img src="${p.posterUrl}" alt="${p.titulo}" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
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
        alert('Error al cargar funciones');
    }
};

function renderFunciones(funciones, peliculaId) {
    if (funciones.length === 0) {
        app.innerHTML = '<p>No hay funciones disponibles</p><button class="btn" onclick="loadPeliculas()">Volver</button>';
        return;
    }

    let html = '<h2>Selecciona un horario</h2><div class="funciones-lista">';
    funciones.forEach(f => {
        const fecha = new Date(f.fechaHora).toLocaleString();
        html += `
            <div class="funcion-card">
                <p><strong>${fecha}</strong></p>
                <p>Sala: ${f.sala.nombre} (Cap. ${f.sala.capacidad})</p>
                <p>Precio: S/ ${f.precioBase}</p>
                <button class="btn" onclick="verAsientos(${f.id})">Seleccionar asientos</button>
            </div>
        `;
    });
    html += '</div><button class="btn" onclick="loadPeliculas()">Volver</button>';
    app.innerHTML = html;
}

// Ver asientos de una función
window.verAsientos = async function(funcionId) {
    if (!token) {
        alert('Debes iniciar sesión para comprar');
        showLogin();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/funciones/${funcionId}/asientos`);
        const asientos = await res.json();
        renderAsientos(asientos, funcionId);
    } catch (error) {
        alert('Error al cargar asientos');
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
            alert('Selecciona al menos un asiento');
            return;
        }
        // Guardar datos de compra
        compraData = {
            funcionId: funcionId,
            asientosIds: seleccionados.map(Number)
        };
        mostrarModalPago();
    });
}

// Funciones para el modal de pago
function mostrarModalPago() {
    const modal = document.getElementById('modal-pago');
    if (!modal) {
        crearModal();
    }
    document.getElementById('modal-pago').style.display = 'flex';
    mostrarFormulario('tarjeta'); // Por defecto
}

function crearModal() {
    const modalHTML = `
        <div id="modal-pago" class="modal" style="display:none;">
            <div class="modal-content">
                <span class="close" onclick="cerrarModal()">&times;</span>
                <h2>Selecciona método de pago</h2>
                <div class="metodos-pago">
                    <button class="btn-metodo" onclick="mostrarFormulario('tarjeta')">Tarjeta</button>
                    <button class="btn-metodo" onclick="mostrarFormulario('transferencia')">Transferencia</button>
                    <button class="btn-metodo" onclick="mostrarFormulario('billetera')">Billetera digital</button>
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
    const container = document.getElementById('form-pago-container');
    let html = '';

    if (metodo === 'tarjeta') {
        html = `
            <form id="form-tarjeta">
                <h3>Pago con tarjeta</h3>
                <input type="text" placeholder="Número de tarjeta" required>
                <input type="text" placeholder="Nombre del titular" required>
                <div style="display: flex; gap: 1rem;">
                    <input type="text" placeholder="MM/AA" required>
                    <input type="text" placeholder="CVV" required>
                </div>
                <button type="submit" class="btn">Pagar</button>
            </form>
        `;
    } else if (metodo === 'transferencia') {
        html = `
            <form id="form-transferencia">
                <h3>Transferencia bancaria</h3>
                <p>Banco: Banco de Crédito</p>
                <p>Cuenta: 123-4567890-123</p>
                <p>CCI: 12345678901234567890</p>
                <label>Número de operación:</label>
                <input type="text" placeholder="Ingrese el número de operación" required>
                <button type="submit" class="btn">Confirmar pago</button>
            </form>
        `;
    } else if (metodo === 'billetera') {
        html = `
            <form id="form-billetera">
                <h3>Billetera digital</h3>
                <select required>
                    <option value="">Seleccione</option>
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

    // Agregar evento submit al formulario
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
                    alert(`¡Compra exitosa! ID: ${data.compraId}`);
                    cerrarModal();
                    loadPeliculas();
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                alert('Error al procesar la compra');
            }
        });
    }
};

// Funciones adicionales para el navbar
window.showProximos = function() {
    app.innerHTML = '<h2>Próximos estrenos</h2><p>Próximamente...</p>';
};

window.showPromociones = function() {
    app.innerHTML = '<h2>Promociones</h2><p>No hay promociones disponibles</p>';
};

// Inicializar
renderUserInfo();
showHome();

// Crear el modal al cargar la página
crearModal();