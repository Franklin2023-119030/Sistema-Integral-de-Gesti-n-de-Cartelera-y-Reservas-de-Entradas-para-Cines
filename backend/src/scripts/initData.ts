import { writeData } from '../utils/fileStorage';

// ==================== INTERFACES ====================
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: string;
}

interface Pelicula {
  id: number;
  titulo: string;
  duracion: number;
  directores: string;
  actores: string;
  fechaLanzamiento: string;
  fechaFinCartelera: string;
  sinopsis: string;
  clasificacion: string;
  posterUrl: string;
}

interface Sala {
  id: number;
  nombre: string;
  capacidad: number;
}

interface Asiento {
  id: number;
  salaId: number;
  fila: string;
  numero: number;
  coordenadas: string;
}

interface Funcion {
  id: number;
  peliculaId: number;
  salaId: number;
  fechaHora: string;
  precioBase: number;
}

// ==================== DATOS DE PELÍCULAS (7) ====================
const peliculas: Pelicula[] = [
  {
    id: 1,
    titulo: 'Scream',
    duracion: 120,
    directores: 'Wes Craven',
    actores: 'Neve Campbell, Courteney Cox',
    fechaLanzamiento: '2026-03-01',
    fechaFinCartelera: '2026-04-15',
    sinopsis: 'Un nuevo asesino acecha a los habitantes de Woodsboro...',
    clasificacion: 'B',
    posterUrl: 'https://via.placeholder.com/200x300?text=Scream'
  },
  {
    id: 2,
    titulo: 'Walk the Line',
    duracion: 135,
    directores: 'James Mangold',
    actores: 'Joaquin Phoenix, Reese Witherspoon',
    fechaLanzamiento: '2026-03-05',
    fechaFinCartelera: '2026-04-20',
    sinopsis: 'La vida del cantante Johnny Cash.',
    clasificacion: 'B',
    posterUrl: 'https://via.placeholder.com/200x300?text=Walk+the+Line'
  },
  {
    id: 3,
    titulo: 'Dune: Parte Dos',
    duracion: 165,
    directores: 'Denis Villeneuve',
    actores: 'Timothée Chalamet, Zendaya',
    fechaLanzamiento: '2026-03-10',
    fechaFinCartelera: '2026-05-01',
    sinopsis: 'Continúa el viaje de Paul Atreides...',
    clasificacion: 'B',
    posterUrl: 'https://via.placeholder.com/200x300?text=Dune+2'
  },
  {
    id: 4,
    titulo: 'Intensamente 2',
    duracion: 100,
    directores: 'Kelsey Mann',
    actores: 'Amy Poehler, Maya Hawke',
    fechaLanzamiento: '2026-03-15',
    fechaFinCartelera: '2026-05-10',
    sinopsis: 'Las emociones de Riley regresan...',
    clasificacion: 'A',
    posterUrl: 'https://via.placeholder.com/200x300?text=Inside+Out+2'
  },
  {
    id: 5,
    titulo: 'Mufasa: El Rey León',
    duracion: 120,
    directores: 'Barry Jenkins',
    actores: 'Aaron Pierre, Kelvin Harrison Jr.',
    fechaLanzamiento: '2026-03-20',
    fechaFinCartelera: '2026-05-20',
    sinopsis: 'El origen del legendario rey de la sabana.',
    clasificacion: 'A',
    posterUrl: 'https://via.placeholder.com/200x300?text=Mufasa'
  },
  {
    id: 6,
    titulo: 'Planeta de los Simios: Nuevo Reino',
    duracion: 145,
    directores: 'Wes Ball',
    actores: 'Owen Teague, Freya Allan',
    fechaLanzamiento: '2026-03-25',
    fechaFinCartelera: '2026-05-30',
    sinopsis: 'Muchos años después del reinado de César...',
    clasificacion: 'B',
    posterUrl: 'https://via.placeholder.com/200x300?text=Planet+of+the+Apes'
  },
  {
    id: 7,
    titulo: 'Beetlejuice 2',
    duracion: 105,
    directores: 'Tim Burton',
    actores: 'Michael Keaton, Winona Ryder',
    fechaLanzamiento: '2026-04-01',
    fechaFinCartelera: '2026-06-01',
    sinopsis: 'El fantasma más travieso regresa.',
    clasificacion: 'B',
    posterUrl: 'https://via.placeholder.com/200x300?text=Beetlejuice+2'
  }
];

// ==================== SALAS ====================
const salas: Sala[] = [
  { id: 1, nombre: 'Sala 1', capacidad: 50 },
  { id: 2, nombre: 'Sala 2', capacidad: 40 }
];

// ==================== ASIENTOS ====================
function generarAsientos(salaId: number, filas: number, asientosPorFila: number): Asiento[] {
  const asientos: Asiento[] = [];
  let idCounter = 1;
  for (let f = 0; f < filas; f++) {
    const filaLetra = String.fromCharCode(65 + f); // A, B, C, ...
    for (let n = 1; n <= asientosPorFila; n++) {
      asientos.push({
        id: idCounter++,
        salaId,
        fila: filaLetra,
        numero: n,
        coordenadas: `${filaLetra}${n}`
      });
    }
  }
  return asientos;
}

// Asientos para sala 1 (5 filas A-E, 10 asientos cada una = 50)
const asientosSala1 = generarAsientos(1, 5, 10);
// Asientos para sala 2 (4 filas A-D, 10 asientos cada una = 40)
const asientosSala2 = generarAsientos(2, 4, 10);
const todosAsientos = [...asientosSala1, ...asientosSala2];

// ==================== FUNCIONES ====================
// Generar funciones para los próximos 5 días, con 3 horarios por día
function generarFunciones(): Funcion[] {
  const funciones: Funcion[] = [];
  let idCounter = 1;

  // Fecha base: 5 de marzo de 2026 (puedes cambiarla si quieres)
  const fechaBase = new Date('2026-03-05');
  const horas = [16, 19, 22]; // 4pm, 7pm, 10pm

  // Por cada película
  for (const pelicula of peliculas) {
    // Por cada día (0 a 4 días después de la fecha base)
    for (let dia = 0; dia < 5; dia++) {
      const fechaActual = new Date(fechaBase);
      fechaActual.setDate(fechaBase.getDate() + dia);
      const año = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
      const diaStr = String(fechaActual.getDate()).padStart(2, '0');

      // Por cada hora
      for (const hora of horas) {
        // Alternar sala: si el índice es par, sala 1; impar, sala 2 (para distribuir)
        const salaId = (idCounter % 2 === 0) ? 1 : 2;
        const fechaHora = `${año}-${mes}-${diaStr}T${hora}:00:00`;

        funciones.push({
          id: idCounter++,
          peliculaId: pelicula.id,
          salaId,
          fechaHora,
          precioBase: 15.0 // precio fijo para todas
        });
      }
    }
  }
  return funciones;
}

const funciones = generarFunciones();

// ==================== GUARDAR ARCHIVOS ====================
async function init() {
  try {
    // Usuarios (vacío inicialmente)
    await writeData<Usuario>('usuarios', []);

    // Películas
    await writeData<Pelicula>('peliculas', peliculas);

    // Salas
    await writeData<Sala>('salas', salas);

    // Asientos
    await writeData<Asiento>('asientos', todosAsientos);

    // Funciones
    await writeData<Funcion>('funciones', funciones);

    // Compras y detalle (vacíos)
    await writeData('compras', []);
    await writeData('detalleCompra', []);

    console.log('✅ Datos inicializados correctamente');
    console.log(`📽️  Películas: ${peliculas.length}`);
    console.log(`🎫 Funciones generadas: ${funciones.length}`);
    console.log(`💺 Asientos: ${todosAsientos.length}`);
  } catch (error) {
    console.error('❌ Error al inicializar datos:', error);
  }
}

init();