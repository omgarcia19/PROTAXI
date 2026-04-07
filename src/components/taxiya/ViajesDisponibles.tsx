import { useState, useEffect } from 'react';
import { obtenerReservacionesPendientes, confirmarViajeChofer } from '@/utils/supabase-reservaciones';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toast } from '@/components/taxiya/Toast';

interface ViajeDisponible {
  id: string;
  cliente_nombre?: string;
  cliente_id?: string;
  domicilio_origen: string;
  domicilio_destino?: string;
  fecha: string;
  hora: string;
  notas?: string;
}

interface Props {
  choferId: string;
}

export default function ViajesDisponibles({ choferId }: Props) {
  const [viajes, setViajes] = useState<ViajeDisponible[]>([]);
  const [cargando, setCargando] = useState(false);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'success' | 'error' } | null>(null);

  // Cargar viajes disponibles
  useEffect(() => {
    cargarViajes();
    
    // Recargar cada 30 segundos para buscar nuevos viajes
    const intervalo = setInterval(cargarViajes, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarViajes = async () => {
    try {
      setCargando(true);
      const datos = await obtenerReservacionesPendientes();
      setViajes(datos as ViajeDisponible[]);
    } catch (error) {
      console.error('Error al cargar viajes:', error);
      setToast({
        mensaje: 'Error al cargar viajes disponibles',
        tipo: 'error',
      });
    } finally {
      setCargando(false);
    }
  };

  const confirmarViaje = async (viajeId: string) => {
    try {
      setConfirmando(viajeId);
      
      const resultado = await confirmarViajeChofer(viajeId, choferId);
      
      if (resultado.success) {
        setToast({
          mensaje: '✅ ¡Viaje confirmado! Ya no aparecerás disponible en el sistema',
          tipo: 'success',
        });
        
        // Quitar el viaje de la lista
        setViajes(viajes.filter(v => v.id !== viajeId));
        
        // Recargar después de 2 segundos
        setTimeout(cargarViajes, 2000);
      } else {
        setToast({
          mensaje: 'Error al confirmar el viaje',
          tipo: 'error',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setToast({
        mensaje: 'Error al confirmar el viaje',
        tipo: 'error',
      });
    } finally {
      setConfirmando(null);
    }
  };

  if (cargando) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Viajes Disponibles</CardTitle>
          <CardDescription>Cargando viajes...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Viajes Disponibles</CardTitle>
          <CardDescription>
            {viajes.length} viaje{viajes.length !== 1 ? 's' : ''} disponible{viajes.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viajes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay viajes disponibles en este momento</p>
              <p className="text-sm mt-2">Se actualizará automáticamente cada 30 segundos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {viajes.map((viaje) => (
                <div
                  key={viaje.id}
                  className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {viaje.hora} - {viaje.fecha}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        📍 {viaje.domicilio_origen}
                      </p>
                      {viaje.domicilio_destino && (
                        <p className="text-sm text-gray-600">
                          📍 {viaje.domicilio_destino}
                        </p>
                      )}
                      {viaje.notas && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          Nota: {viaje.notas}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => confirmarViaje(viaje.id)}
                    disabled={confirmando === viaje.id}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {confirmando === viaje.id ? '⏳ Confirmando...' : '✓ Confirmar Viaje'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={cargarViajes}
            variant="outline"
            className="w-full mt-4"
            disabled={cargando}
          >
            🔄 Recargar viajes
          </Button>
        </CardContent>
      </Card>

      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
