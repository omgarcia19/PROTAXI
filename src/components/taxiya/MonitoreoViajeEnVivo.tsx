import { useEffect, useState } from 'react';
import { useReservacionEnVivo } from '@/hooks/useReservacionesEnVivo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  reservacionId: string;
}

export default function MonitoreoViajeEnVivo({ reservacionId }: Props) {
  const { reservacion, cargando } = useReservacionEnVivo(reservacionId);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [choferAsignado, setChoferAsignado] = useState(false);

  // Mostrar notificación cuando se asigna un chofer
  useEffect(() => {
    if (reservacion?.choferes && !choferAsignado) {
      setChoferAsignado(true);
      setMostrarNotificacion(true);

      // Quitar notificación después de 5 segundos
      const timer = setTimeout(() => setMostrarNotificacion(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [reservacion?.choferes, choferAsignado]);

  if (cargando) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!reservacion) {
    return null;
  }

  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmada':
        return 'bg-blue-100 text-blue-800';
      case 'en_camino':
        return 'bg-purple-100 text-purple-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstatusTexto = (estatus: string) => {
    switch (estatus) {
      case 'pendiente':
        return '⏳ En espera de chofer';
      case 'confirmada':
        return '✅ Confirmado';
      case 'en_camino':
        return '🚗 En camino';
      case 'completada':
        return '✔️ Completado';
      case 'cancelada':
        return '❌ Cancelado';
      default:
        return estatus;
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden">
        {/* Notificación de chofer asignado */}
        {mostrarNotificacion && reservacion.choferes && (
          <div className="absolute top-0 left-0 right-0 bg-green-500 text-white px-4 py-3 animate-pulse">
            <p className="font-semibold text-sm">✅ ¡Tu chofer ha sido asignado!</p>
          </div>
        )}

        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">Detalles del Viaje</CardTitle>
            <Badge className={`${getEstatusColor(reservacion.estatus)} border-0`}>
              {getEstatusTexto(reservacion.estatus)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información del viaje */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-semibold">{reservacion.fecha} a las {reservacion.hora}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-lg">📍</span>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Origen</p>
                <p className="font-semibold text-sm">{reservacion.domicilio_origen}</p>
              </div>
            </div>

            {reservacion.domicilio_destino && (
              <div className="flex items-start gap-2">
                <span className="text-lg">🎯</span>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Destino</p>
                  <p className="font-semibold text-sm">{reservacion.domicilio_destino}</p>
                </div>
              </div>
            )}

            {reservacion.notas && (
              <div className="flex items-start gap-2">
                <span className="text-lg">📝</span>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-semibold text-sm">{reservacion.notas}</p>
                </div>
              </div>
            )}
          </div>

          {/* Información del chofer - SE ACTUALIZA EN TIEMPO REAL */}
          {reservacion.choferes ? (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">Tu Chofer</p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 flex items-center gap-3">
                {reservacion.choferes.foto_perfil && (
                  <img
                    src={reservacion.choferes.foto_perfil}
                    alt={reservacion.choferes.nombre}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-lg">{reservacion.choferes.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    📞 {reservacion.choferes.telefono}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {reservacion.choferes.marca} {reservacion.choferes.modelo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Placas: {reservacion.choferes.placas}
                    {reservacion.choferes.color && ` • Color: ${reservacion.choferes.color}`}
                  </p>
                  {reservacion.choferes.calificacion && (
                    <p className="text-xs text-muted-foreground">
                      ⭐ {reservacion.choferes.calificacion}/5
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4">
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-lg">🔍</p>
                <p className="font-semibold text-gray-700">Buscando chofer disponible...</p>
                <p className="text-xs text-gray-500 mt-1">
                  Te notificaremos cuando se asigne uno
                </p>
              </div>
            </div>
          )}

          {/* Información adicional del viaje */}
          {(reservacion.costo || reservacion.distancia_km || reservacion.duracion_minutos) && (
            <div className="border-t pt-4 grid grid-cols-3 gap-2">
              {reservacion.costo && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Costo</p>
                  <p className="font-semibold">${reservacion.costo.toFixed(2)}</p>
                </div>
              )}
              {reservacion.distancia_km && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Distancia</p>
                  <p className="font-semibold">{reservacion.distancia_km.toFixed(1)} km</p>
                </div>
              )}
              {reservacion.duracion_minutos && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Duración</p>
                  <p className="font-semibold">{reservacion.duracion_minutos} min</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
