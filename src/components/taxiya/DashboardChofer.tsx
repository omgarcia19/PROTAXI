import { useState, useEffect, useCallback } from "react";
import {
  type Chofer,
  type Reservacion,
  getReservaciones,
  confirmarReservacion,
  cerrarSesion,
} from "@/lib/taxiya-store";
import { obtenerReservacionesSupabase, confirmarReservacionSupabase } from "@/utils/supabase-reservaciones";
import { useToast } from "./Toast";

interface Props {
  chofer: Chofer;
  onLogout: () => void;
}

export default function DashboardChofer({ chofer, onLogout }: Props) {
  const { show } = useToast();
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // Obtener de Supabase
      const data = await obtenerReservacionesSupabase();
      setReservaciones(data);
    } catch (error) {
      console.error("Error al cargar reservaciones:", error);
      // Fallback a localStorage
      setReservaciones(getReservaciones());
    }
  }, []);

  useEffect(() => {
    refresh();
    setCargando(false);
    
    // Actualizar cada 3 segundos
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const pendientes = reservaciones.filter((r) => r.estatus === "pendiente");
  const misServicios = reservaciones.filter(
    (r) => r.choferAsignado?.placas === chofer.placas
  );

  const handleConfirmar = async (id: string) => {
    try {
      // Confirmar en Supabase
      const ok = await confirmarReservacionSupabase(
        id,
        chofer.placas
      );

      if (!ok) {
        show("❌ Este servicio ya fue tomado por otro conductor", "error");
        refresh();
        return;
      }

      // También actualizar localStorage como backup
      confirmarReservacion(id, {
        nombre: chofer.nombre,
        placas: chofer.placas,
        marca: chofer.marca,
        modelo: chofer.modelo,
        foto: chofer.foto,
      });

      refresh();
      show("✅ ¡Servicio confirmado!");
    } catch (error) {
      console.error("Error al confirmar:", error);
      show("❌ Error al confirmar el servicio", "error");
    }
  };

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
          <img src={chofer.foto} alt="" className="w-8 h-8 rounded-full object-cover border border-primary" />
          <button onClick={handleLogout} className="text-sm font-body text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <img src={chofer.foto} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Hola, {chofer.nombre} 🚗</h1>
            <div className="flex gap-2 mt-1 flex-wrap">
              {[chofer.placas, chofer.marca, chofer.modelo].map((t) => (
                <span key={t} className="bg-primary/20 text-foreground text-xs font-body font-medium px-2 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Servicios Disponibles */}
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-1 flex items-center gap-2">
            Servicios Disponibles
            {pendientes.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {pendientes.length}
              </span>
            )}
          </h2>
          {pendientes.length === 0 ? (
            <p className="text-muted-foreground font-body text-center py-8">No hay servicios pendientes por ahora.</p>
          ) : (
            <div className="space-y-3">
              {pendientes.map((r) => (
                <div key={r.id} className="bg-card rounded-2xl p-5 shadow border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-heading font-bold text-foreground text-sm">👤 {r.clienteNombre}</span>
                    <span className="text-xs font-heading font-semibold px-3 py-1 rounded-full bg-primary/20 text-foreground">
                      ⏳ Pendiente
                    </span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">📅 {r.fecha} — 🕐 {r.hora}</p>
                  <p className="font-body text-sm text-muted-foreground">📍 {r.domicilio}</p>
                  {r.notas && <p className="font-body text-sm text-muted-foreground">📝 {r.notas}</p>}
                  <button
                    onClick={() => handleConfirmar(r.id)}
                    className="mt-3 w-full py-2 bg-success text-success-foreground rounded-xl font-heading font-bold text-sm hover:scale-[1.02] transition-transform shadow"
                  >
                    ✅ Confirmar este servicio
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mis Servicios Aceptados */}
        {misServicios.length > 0 && (
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground mb-4">Mis Servicios Aceptados</h2>
            <div className="space-y-3">
              {misServicios.map((r) => (
                <div key={r.id} className="bg-card rounded-2xl p-5 shadow border border-success/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-heading font-bold text-foreground text-sm">👤 {r.clienteNombre}</span>
                    <span className="text-xs font-heading font-semibold px-3 py-1 rounded-full bg-success/20 text-success">
                      En camino 🚕
                    </span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">📅 {r.fecha} — 🕐 {r.hora}</p>
                  <p className="font-body text-sm text-muted-foreground">📍 {r.domicilio}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="py-6 text-center text-muted-foreground font-body text-sm">
        TaxiYa © 2025 — Tu taxi, a tu puerta 🚕
      </footer>
    </div>
  );
}
