import { useState, useEffect, useCallback } from "react";
import {
  type Cliente,
  type Reservacion,
  getReservaciones,
  crearReservacion,
  generarId,
  cerrarSesion,
} from "@/lib/taxiya-store";
import { crearReservacionSupabase, obtenerReservacionesSupabase } from "@/utils/supabase-reservaciones";
import { useToast } from "./Toast";

interface Props {
  cliente: Cliente;
  onLogout: () => void;
}

export default function DashboardCliente({ cliente, onLogout }: Props) {
  const { show } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await obtenerReservacionesSupabase();
      // Filtrar solo las del cliente actual
      setReservaciones(data.filter((r) => r.clienteTelefono === cliente.telefono));
    } catch (error) {
      console.error("Error al cargar reservaciones:", error);
      // Fallback a localStorage
      setReservaciones(getReservaciones().filter((r) => r.clienteTelefono === cliente.telefono));
    }
  }, [cliente.telefono]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

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
                    <div className="mt-3 p-3 bg-success/10 rounded-xl space-y-2">
                      <div className="flex items-center gap-3">
                        <img src={r.choferAsignado.foto} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-heading font-semibold text-sm text-foreground">{r.choferAsignado.nombre}</p>
                          <p className="font-body text-xs text-muted-foreground">
                            {r.choferAsignado.marca} {r.choferAsignado.modelo} — {r.choferAsignado.placas}
                          </p>
                          {r.choferAsignado.telefono && (
                            <p className="font-body text-xs text-muted-foreground">📞 {r.choferAsignado.telefono}</p>
                          )}
                        </div>
                      </div>
                      {r.choferAsignado.telefono && (
                        <a
                          href={`https://wa.me/52${r.choferAsignado.telefono}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 bg-[#25D366] text-white rounded-xl font-heading font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Contactar por WhatsApp
                        </a>
                      )}
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
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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
