import { useState } from 'react';
import { useReservacionesClienteEnVivo } from '@/hooks/useReservacionesEnVivo';
import MonitoreoViajeEnVivo from '@/components/taxiya/MonitoreoViajeEnVivo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  clienteId: string;
  clienteNombre: string;
}

/**
 * Dashboard EJEMPLO que muestra cómo integrar el sistema de actualización en tiempo real
 * Este componente monitorea TODAS las reservaciones del cliente y las actualiza automáticamente
 */
export default function DashboardClienteConRealtimeEjemplo({ clienteId, clienteNombre }: Props) {
  const { reservaciones, cargando } = useReservacionesClienteEnVivo(clienteId);

  if (cargando) {
    return (
      <div className="min-h-screen bg-muted p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚕</span>
          <span className="font-heading font-bold text-primary text-xl">TaxiYa</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-body text-sm text-secondary-foreground/70 hidden sm:block">
            {clienteNombre}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-6 animate-fade-in">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Bienvenido/a, {clienteNombre} 👋
        </h1>

        <button className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
          🚕 Reservar Taxi Ahora
        </button>

        {/* Mis Reservaciones - CON ACTUALIZACIÓN EN TIEMPO REAL */}
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">
            Mis Reservaciones ({reservaciones.length})
          </h2>

          {reservaciones.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No tienes reservaciones aún.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crea una nueva para ver los detalles en tiempo real
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reservaciones.map((reservacion) => (
                <MonitoreoViajeEnVivo key={reservacion.id} reservacionId={reservacion.id} />
              ))}
            </div>
          )}
        </div>

        {/* Info de cómo funciona */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">ℹ️ Cómo funciona</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>
              ✅ Cuando creas una reservación, ves "Buscando chofer disponible..."
            </p>
            <p>
              ✅ Los choferes ven tu viaje en su panel de "Viajes Disponibles"
            </p>
            <p>
              ✅ Cuando un chofer confirma, **verás los datos instantáneamente**
            </p>
            <p>
              ✅ No necesitas recargar la página - ¡todo se actualiza en vivo!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * EJEMPLO de uso simple en un componente:
 *
 * import { useReservacionesClienteEnVivo } from '@/hooks/useReservacionesEnVivo';
 * import MonitoreoViajeEnVivo from '@/components/taxiya/MonitoreoViajeEnVivo';
 *
 * export default function MisViajes({ clienteId }) {
 *   const { reservaciones, cargando } = useReservacionesClienteEnVivo(clienteId);
 *
 *   return (
 *     <div>
 *       {reservaciones.map(r => (
 *         <MonitoreoViajeEnVivo key={r.id} reservacionId={r.id} />
 *       ))}
 *     </div>
 *   );
 * }
 */
