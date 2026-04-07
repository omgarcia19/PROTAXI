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
  estatus: "pendiente" | "confirmada" | "encamino" | "completada";
  choferAsignado: {
    nombre: string;
    placas: string;
    marca: string;
    modelo: string;
    foto: string;
    telefono?: string;
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
  
  // Verificar si ya existe
  if (lista.find((x) => x.placas === c.placas.toUpperCase())) {
    console.warn("Placas duplicadas:", c.placas);
    return false;
  }
  
  // Normalizar placas
  c.placas = c.placas.toUpperCase();
  
  try {
    lista.push(c);
    setArray(KEYS.choferes, lista);
    console.log("Chofer registrado:", c);
    return true;
  } catch (error) {
    console.error("Error al registrar chofer:", error);
    // Si falla por tamaño, intentar limpiar la foto
    if (error instanceof Error && error.message.includes("QuotaExceeded")) {
      console.warn("localStorage lleno, intentando limpiar fotos antiguas...");
      // Mantener solo los últimos 3 choferes
      if (lista.length > 3) {
        lista.shift();
        try {
          setArray(KEYS.choferes, lista);
          lista.push(c);
          setArray(KEYS.choferes, lista);
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  }
}

export function loginChofer(placas: string): Chofer | null {
  return getChoferes().find((c) => c.placas === placas.toUpperCase()) || null;
}

// ── Reservaciones ──
export function getReservaciones(): Reservacion[] {
  return getArray<Reservacion>(KEYS.reservaciones);
}

// ── Webhook Make.com ──
const WEBHOOK_URL = "https://hook.us2.make.com/ode2m6u6ubkbvg8rqbdxqiwu3823vk9r";

async function enviarWebhook(reservacion: Reservacion) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: reservacion.id,
        clienteNombre: reservacion.clienteNombre,
        clienteTelefono: reservacion.clienteTelefono,
        fecha: reservacion.fecha,
        hora: reservacion.hora,
        domicilio: reservacion.domicilio,
        coordenadas: reservacion.coordenadas,
        notas: reservacion.notas,
        estatus: reservacion.estatus,
        timestamp: reservacion.timestamp,
      }),
    });
    
    if (!response.ok) {
      console.warn("Webhook no respondió correctamente:", response.statusText);
    }
  } catch (error) {
    console.error("Error al enviar webhook:", error);
  }
}

export function crearReservacion(r: Reservacion) {
  const lista = getReservaciones();
  lista.push(r);
  setArray(KEYS.reservaciones, lista);
  
  // Enviar webhook a Make.com
  enviarWebhook(r);
}

export function confirmarReservacion(id: string, chofer: Reservacion["choferAsignado"]) {
  const lista = getReservaciones();
  const idx = lista.findIndex((r) => r.id === id);
  if (idx !== -1) {
    // Si ya fue confirmada, no permitir que otro chofer la tome
    if (lista[idx].estatus !== "pendiente") {
      console.warn("Esta reservación ya fue confirmada por otro conductor");
      return false;
    }
    
    lista[idx].estatus = "confirmada";
    lista[idx].choferAsignado = chofer;
    setArray(KEYS.reservaciones, lista);
    return true;
  }
  return false;
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
