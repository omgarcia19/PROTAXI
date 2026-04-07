import { useState, useCallback } from "react";
import {
  type Cliente,
  type Reservacion,
  getReservaciones,
  crearReservacion,
  generarId,
  cerrarSesion,
} from "@/lib/taxiya-store";
import { crearReservacionSupabase } from "@/utils/supabase-reservaciones";
import { useToast } from "./Toast";

interface Props {
  cliente: Cliente;
  onLogout: () => void;
}

export default function DashboardCliente({ cliente, onLogout }: Props) {
  const { show } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [reservaciones, setReservaciones] = useState<Reservacion[]>(() =>
    getReservaciones().filter((r) => r.clienteTelefono === cliente.telefono)
  );

  const refresh = useCallback(() => {
    setReservaciones(getReservaciones().filter((r) => r.clienteTelefono === cliente.telefono));
  }, [cliente.telefono]);

  const handleLogout = () => {
    cerrarSesion();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚕</span>
          <span className="font-heading font-bold text-primary text-xl">TaxiYa</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-body text-sm text-secondary-foreground/70 hidden sm:block">
            {cliente.nombre}
          </span>
          <button onClick={handleLogout} className="text-sm font-body text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6 animate-fade-in">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Bienvenido/a, {cliente.nombre} 👋
        </h1>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          🚕 Reservar Taxi Ahora
        </button>

        {/* Mis Reservaciones */}
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">Mis Reservaciones</h2>
          {reservaciones.length === 0 ? (
            <p className="text-muted-foreground font-body text-center py-8">No tienes reservaciones aún.</p>
          ) : (
            <div className="space-y-3">
              {reservaciones.map((r) => (
                <div key={r.id} className="bg-card rounded-2xl p-5 shadow border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-heading font-bold text-foreground text-sm">🔖 {r.id}</span>
                    <span
                      className={`text-xs font-heading font-semibold px-3 py-1 rounded-full ${
                        r.estatus === "pendiente"
                          ? "bg-primary/20 text-primary-foreground"
                          : "bg-success/20 text-success"
                      }`}
                      style={r.estatus === "pendiente" ? { color: "hsl(var(--foreground))" } : {}}
                    >
                      {r.estatus === "pendiente" ? "⏳ Pendiente" : "✅ Confirmada"}
                    </span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">📅 {r.fecha} — 🕐 {r.hora}</p>
                  <p className="font-body text-sm text-muted-foreground">📍 {r.domicilio}</p>
                  {r.notas && <p className="font-body text-sm text-muted-foreground">📝 {r.notas}</p>}
                  {r.choferAsignado && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-success/10 rounded-xl">
                      <img src={r.choferAsignado.foto} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-heading font-semibold text-sm text-foreground">{r.choferAsignado.nombre}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {r.choferAsignado.marca} {r.choferAsignado.modelo} — {r.choferAsignado.placas}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Reservar */}
      {modalOpen && (
        <ModalReservar
          cliente={cliente}
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            refresh();
            setModalOpen(false);
            show("¡Reservación creada exitosamente! 🎉");
          }}
        />
      )}

      <footer className="py-6 text-center text-muted-foreground font-body text-sm">
        TaxiYa © 2025 — Tu taxi, a tu puerta 🚕
      </footer>
    </div>
  );
}

// ── Modal de reservación ──
function ModalReservar({
  cliente,
  onClose,
  onCreated,
}: {
  cliente: Cliente;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { show } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const [fecha, setFecha] = useState(today);
  const [hora, setHora] = useState("");
  const [domicilio, setDomicilio] = useState(cliente.direccion);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [notas, setNotas] = useState("");
  const [loadingGps, setLoadingGps] = useState(false);

  const usarGps = () => {
    if (!navigator.geolocation) {
      show("GPS no disponible en este dispositivo", "error");
      return;
    }
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ lat, lon });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();
          setDomicilio(data.display_name || `${lat}, ${lon}`);
        } catch {
          setDomicilio(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        }
        setLoadingGps(false);
        show("📍 Ubicación obtenida");
      },
      () => {
        setLoadingGps(false);
        show("No se pudo obtener la ubicación", "error");
      }
    );
  };

  const confirmar = async () => {
    if (!fecha || !hora || !domicilio) {
      show("Completa fecha, hora y domicilio", "error");
      return;
    }
    
    const nuevaReservacion: Reservacion = {
      id: generarId(),
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      fecha,
      hora,
      domicilio,
      coordenadas: coords,
      notas,
      estatus: "pendiente",
      choferAsignado: null,
      timestamp: Date.now(),
    };

    // Guardar en Supabase
    const ok = await crearReservacionSupabase(nuevaReservacion);
    
    if (!ok) {
      show("Error al guardar la reservación. Intenta de nuevo.", "error");
      return;
    }

    // También guardar en localStorage como backup
    crearReservacion(nuevaReservacion);
    onCreated();
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-sm outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-heading font-bold text-foreground">🚕 Nueva Reservación</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1 block">📅 Fecha</label>
              <input type="date" min={today} value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1 block">🕐 Hora</label>
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-sm font-body font-medium text-foreground mb-1 block">📍 Domicilio de recogida</label>
            <button
              onClick={usarGps}
              disabled={loadingGps}
              className="mb-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl font-body text-sm hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              {loadingGps ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin-slow" />
                  Obteniendo ubicación...
                </>
              ) : (
                "📡 Usar mi ubicación actual (GPS)"
              )}
            </button>
            <input value={domicilio} onChange={(e) => { setDomicilio(e.target.value); setCoords(null); }} placeholder="O escribe tu dirección" className={inputClass} />
            {coords && (
              <iframe
                title="Mapa"
                className="mt-2 w-full h-48 rounded-xl border border-border"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.005},${coords.lat - 0.005},${coords.lon + 0.005},${coords.lat + 0.005}&layer=mapnik&marker=${coords.lat},${coords.lon}`}
              />
            )}
          </div>

          <div>
            <label className="text-sm font-body font-medium text-foreground mb-1 block">📝 Notas adicionales</label>
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: portón azul, edificio 3..." rows={3} className={inputClass + " resize-none"} />
          </div>

          <button onClick={confirmar} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg">
            Confirmar Reservación ✅
          </button>
        </div>
      </div>
    </div>
  );
}
