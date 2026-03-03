// frontend/public/js/app.js

const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

// Elementos del DOM
const app = document.getElementById('app');
const userInfo = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout'); // Lo crearemos dinámicamente, pero lo manejamos después

// Función para renderizar la vista actual
function renderizarVista(vista) {
    app.innerHTML = vista;
}

// Actualizar la información del usuario en el header
function actualizarUserInfo() {
    if (usuario) {
        userInfo.innerHTML = `
            <span>Bienvenido, ${usuario.nombre}</span>
            <button id="logout">Cerrar sesión</button>
        `;
        document.getElementById('logout')?.addEventListener('click', cerrarSesion);
    } else {
        userInfo.innerHTML = `
            <button id="btn-login">Iniciar sesión</button>
            <button id="btn-register">Registrarse</button>
        `;
        document.getElementById('btn-login')?.addEventListener('click', mostrarLogin);
        document.getElementById('btn-register')?.addEventListener('click', mostrarRegistro);
    }
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    token = null;
    usuario = null;
    actualizarUserInfo();
    mostrarCartelera();
}

// Mostrar formulario de registro
function mostrarRegistro() {
    renderizarVista(`
        <h2>Registro</h2>
        <form id="form-registro">
            <input type="text" id="nombre" placeholder="Nombre" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Contraseña" required>
            <button type="submit">Registrarse</button>
        </form>
        <p id="mensaje"></p>
    `);

    document.getElementById('form-registro').addEventListener('submit', async (e) => {
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
                document.getElementById('mensaje').innerText = 'Registro exitoso. Ahora inicia sesión.';
                setTimeout(mostrarLogin, 2000);
            } else {
                document.getElementById('mensaje').innerText = data.error || 'Error al registrar';
            }
        } catch (error) {
            document.getElementById('mensaje').innerText = 'Error de conexión';
        }
    });
}

// Mostrar formulario de login
function mostrarLogin() {
    renderizarVista(`
        <h2>Iniciar sesión</h2>
        <form id="form-login">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Contraseña" required>
            <button type="submit">Ingresar</button>
        </form>
        <p id="mensaje"></p>
    `);

    document.getElementById('form-login').addEventListener('submit', async (e) => {
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
                actualizarUserInfo();
                mostrarCartelera();
            } else {
                document.getElementById('mensaje').innerText = data.error || 'Credenciales inválidas';
            }
        } catch (error) {
            document.getElementById('mensaje').innerText = 'Error de conexión';
        }
    });
}

// Mostrar cartelera de películas
async function mostrarCartelera() {
    try {
        const res = await fetch(`${API_URL}/peliculas`);
        const peliculas = await res.json();

        let html = '<h2>Cartelera</h2><div class="grid-peliculas">';
        peliculas.forEach(p => {
            html += `
                <div class="pelicula-card" data-id="${p.id}">
                    <img src="${p.posterUrl}" alt="${p.titulo}">
                    <h3>${p.titulo}</h3>
                    <p>Duración: ${p.duracion} min</p>
                    <p>Clasificación: ${p.clasificacion}</p>
                    <button class="btn-ver-funciones">Ver horarios</button>
                </div>
            `;
        });
        html += '</div>';
        renderizarVista(html);

        // Agregar eventos a los botones de ver horarios
        document.querySelectorAll('.btn-ver-funciones').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.pelicula-card');
                const peliculaId = card.dataset.id;
                mostrarFunciones(peliculaId);
            });
        });
    } catch (error) {
        renderizarVista('<p>Error al cargar películas</p>');
    }
}

// Mostrar funciones de una película
async function mostrarFunciones(peliculaId) {
    try {
        const res = await fetch(`${API_URL}/funciones/pelicula/${peliculaId}`);
        const funciones = await res.json();

        if (funciones.length === 0) {
            renderizarVista('<p>No hay funciones disponibles para esta película.</p><button id="volver">Volver</button>');
            document.getElementById('volver')?.addEventListener('click', mostrarCartelera);
            return;
        }

        let html = '<h2>Horarios disponibles</h2><div class="lista-funciones">';
        funciones.forEach(f => {
            const fecha = new Date(f.fechaHora).toLocaleString();
            html += `
                <div class="funcion-card" data-id="${f.id}" data-sala="${f.sala.nombre}">
                    <p><strong>Sala:</strong> ${f.sala.nombre}</p>
                    <p><strong>Fecha y hora:</strong> ${fecha}</p>
                    <p><strong>Precio:</strong> S/ ${f.precioBase}</p>
                    <button class="btn-seleccionar-asientos">Seleccionar asientos</button>
                </div>
            `;
        });
        html += '</div><button id="volver">Volver a cartelera</button>';
        renderizarVista(html);

        document.querySelectorAll('.btn-seleccionar-asientos').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.funcion-card');
                const funcionId = card.dataset.id;
                const salaNombre = card.dataset.sala;
                mostrarAsientos(funcionId, salaNombre);
            });
        });

        document.getElementById('volver')?.addEventListener('click', mostrarCartelera);
    } catch (error) {
        renderizarVista('<p>Error al cargar funciones</p><button id="volver">Volver</button>');
        document.getElementById('volver')?.addEventListener('click', mostrarCartelera);
    }
}

// Mostrar asientos de una función
async function mostrarAsientos(funcionId, salaNombre) {
    if (!token) {
        alert('Debes iniciar sesión para comprar asientos');
        mostrarLogin();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/funciones/${funcionId}/asientos`);
        const asientos = await res.json();

        let html = `<h2>Sala: ${salaNombre}</h2>`;
        html += '<div class="mapa-butacas" id="mapa">';

        // Agrupar por fila para mostrarlos ordenados
        const filas = {};
        asientos.forEach(a => {
            if (!filas[a.fila]) filas[a.fila] = [];
            filas[a.fila].push(a);
        });

        // Ordenar filas alfabéticamente
        const filasOrdenadas = Object.keys(filas).sort();

        filasOrdenadas.forEach(fila => {
            html += `<div class="fila">`;
            filas[fila].forEach(asiento => {
                const clase = asiento.ocupado ? 'ocupado' : 'libre';
                html += `<div class="asiento ${clase}" data-id="${asiento.id}" data-coordenadas="${asiento.coordenadas}">${asiento.coordenadas}</div>`;
            });
            html += `</div>`;
        });
        html += '</div>';

        html += `
            <div id="seleccionados">Asientos seleccionados: </div>
            <button id="comprar" disabled>Comprar</button>
            <button id="volver">Volver a horarios</button>
        `;

        renderizarVista(html);

        const seleccionados = new Set(); // guardar ids de asientos seleccionados
        const asientosMap = new Map(); // para obtener datos fácilmente

        document.querySelectorAll('.asiento.libre').forEach(el => {
            asientosMap.set(el.dataset.id, el);
            el.addEventListener('click', () => {
                const id = parseInt(el.dataset.id);
                if (seleccionados.has(id)) {
                    seleccionados.delete(id);
                    el.classList.remove('seleccionado');
                } else {
                    seleccionados.add(id);
                    el.classList.add('seleccionado');
                }
                actualizarBotonCompra(seleccionados);
            });
        });

        function actualizarBotonCompra(seleccionados) {
            const btn = document.getElementById('comprar');
            const divSeleccionados = document.getElementById('seleccionados');
            if (seleccionados.size > 0) {
                btn.disabled = false;
                const coordenadas = Array.from(seleccionados).map(id => {
                    return asientosMap.get(id.toString())?.dataset.coordenadas;
                }).join(', ');
                divSeleccionados.innerText = `Asientos seleccionados: ${coordenadas}`;
            } else {
                btn.disabled = true;
                divSeleccionados.innerText = 'Asientos seleccionados: ';
            }
        }

        document.getElementById('comprar').addEventListener('click', () => {
            if (seleccionados.size === 0) return;
            mostrarPago(funcionId, Array.from(seleccionados));
        });

        document.getElementById('volver').addEventListener('click', () => {
            mostrarFunciones(new URLSearchParams(window.location.search).get('peliculaId') || 1); // Mejor pasar el id
        });

    } catch (error) {
        console.error(error);
        renderizarVista('<p>Error al cargar asientos</p><button id="volver">Volver</button>');
        document.getElementById('volver')?.addEventListener('click', mostrarCartelera);
    }
}

// Mostrar opciones de pago
function mostrarPago(funcionId, asientosIds) {
    renderizarVista(`
        <h2>Selecciona método de pago</h2>
        <form id="form-pago">
            <label>
                <input type="radio" name="metodo" value="tarjeta" checked> Tarjeta de crédito/débito
            </label><br>
            <label>
                <input type="radio" name="metodo" value="transferencia"> Transferencia bancaria
            </label><br>
            <label>
                <input type="radio" name="metodo" value="billetera"> Billetera digital
            </label><br><br>
            <button type="submit">Confirmar compra</button>
        </form>
        <p id="mensaje-pago"></p>
        <button id="volver">Volver a asientos</button>
    `);

    document.getElementById('form-pago').addEventListener('submit', async (e) => {
        e.preventDefault();
        const metodo = document.querySelector('input[name="metodo"]:checked').value;
        const mensaje = document.getElementById('mensaje-pago');
        mensaje.innerText = 'Procesando...';

        try {
            const res = await fetch(`${API_URL}/compras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuarioId: usuario.id,
                    funcionId,
                    asientosIds,
                    metodoPago: metodo
                })
            });
            const data = await res.json();
            if (res.ok) {
                mensaje.innerText = '¡Compra exitosa!';
                setTimeout(() => mostrarCartelera(), 2000);
            } else {
                mensaje.innerText = data.error || 'Error en la compra';
            }
        } catch (error) {
            mensaje.innerText = 'Error de conexión';
        }
    });

    document.getElementById('volver').addEventListener('click', () => {
        mostrarAsientos(funcionId, 'Sala'); // Necesitamos el nombre de sala, lo podemos pasar como parámetro
    });
}

// Inicialización
actualizarUserInfo();
mostrarCartelera();