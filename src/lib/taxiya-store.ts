// ── TaxiYa: Gestión de estado con localStorage ──

export interface Cliente {
  nombre: string;
  telefono: string;
  direccion: string;
  correo?: string;
}

export interface Chofer {
  nombre: string;
  placas: string;
  modelo: string;
  marca: string;
  foto: string; // base64
}

export interface Reservacion {
  id: string;
  clienteNombre: string;
  clienteTelefono: string;
  fecha: string;
  hora: string;
  domicilio: string;
  coordenadas?: { lat: number; lon: number } | null;
  notas: string;
  estatus: "pendiente" | "confirmada";
  choferAsignado: {
    nombre: string;
    placas: string;
    marca: string;
    modelo: string;
    foto: string;
  } | null;
  timestamp: number;
}

export interface SesionActiva {
  tipo: "cliente" | "chofer";
  id: string; // telefono o placas
}

const KEYS = {
  clientes: "taxiya_clientes",
  choferes: "taxiya_choferes",
  reservaciones: "taxiya_reservaciones",
  sesion: "taxiya_sesion_activa",
};

function getArray<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setArray<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Clientes ──
export function getClientes(): Cliente[] {
  return getArray<Cliente>(KEYS.clientes);
}

export function registrarCliente(c: Cliente): boolean {
  const lista = getClientes();
  if (lista.find((x) => x.telefono === c.telefono)) return false;
  lista.push(c);
  setArray(KEYS.clientes, lista);
  return true;
}

export function loginCliente(telefono: string): Cliente | null {
  return getClientes().find((c) => c.telefono === telefono) || null;
}

// ── Choferes ──
export function getChoferes(): Chofer[] {
  return getArray<Chofer>(KEYS.choferes);
}

export function registrarChofer(c: Chofer): boolean {
  const lista = getChoferes();
  if (lista.find((x) => x.placas === c.placas)) return false;
  lista.push(c);
  setArray(KEYS.choferes, lista);
  return true;
}

export function loginChofer(placas: string): Chofer | null {
  return getChoferes().find((c) => c.placas === placas.toUpperCase()) || null;
}

// ── Reservaciones ──
export function getReservaciones(): Reservacion[] {
  return getArray<Reservacion>(KEYS.reservaciones);
}

export function crearReservacion(r: Reservacion) {
  const lista = getReservaciones();
  lista.push(r);
  setArray(KEYS.reservaciones, lista);
}

export function confirmarReservacion(id: string, chofer: Reservacion["choferAsignado"]) {
  const lista = getReservaciones();
  const idx = lista.findIndex((r) => r.id === id);
  if (idx !== -1) {
    lista[idx].estatus = "confirmada";
    lista[idx].choferAsignado = chofer;
    setArray(KEYS.reservaciones, lista);
  }
}

// ── Sesión ──
export function getSesion(): SesionActiva | null {
  try {
    const s = localStorage.getItem(KEYS.sesion);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function setSesion(s: SesionActiva) {
  localStorage.setItem(KEYS.sesion, JSON.stringify(s));
}

export function cerrarSesion() {
  localStorage.removeItem(KEYS.sesion);
}

export function generarId(): string {
  return "TXY-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}
