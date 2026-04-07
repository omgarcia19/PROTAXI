import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';

export interface ReservacionEnVivo {
  id: string;
  cliente_id: string;
  chofer_id?: string;
  fecha: string;
  hora: string;
  domicilio_origen: string;
  domicilio_destino?: string;
  lat_origen?: number;
  lon_origen?: number;
  lat_destino?: number;
  lon_destino?: number;
  notas?: string;
  estatus: 'pendiente' | 'confirmada' | 'en_camino' | 'completada' | 'cancelada';
  costo?: number;
  duracion_minutos?: number;
  distancia_km?: number;
  timestamp: number;
  created_at: string;
  updated_at: string;
  choferes?: {
    id: string;
    nombre: string;
    telefono: string;
    placas: string;
    marca: string;
    modelo: string;
    color?: string;
    foto_perfil?: string;
    calificacion?: number;
  } | null;
  clientes?: {
    id: string;
    nombre: string;
    telefono: string;
  } | null;
}

/**
 * Hook para escuchar cambios en tiempo real de una reservación
 * Útil para que el cliente vea cuando un chofer confirma su viaje
 */
export function useReservacionEnVivo(reservacionId: string) {
  const [reservacion, setReservacion] = useState<ReservacionEnVivo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!reservacionId) {
      setCargando(false);
      return;
    }

    // Cargar la reservación inicial
    const cargarInicial = async () => {
      try {
        setCargando(true);
        const { data, error: err } = await supabase
          .from('reservaciones')
          .select(`
            *,
            choferes (*),
            clientes (*)
          `)
          .eq('id', reservacionId)
          .single();

        if (err) throw err;
        setReservacion(data as ReservacionEnVivo);
        setError(null);
      } catch (err) {
        setError(err);
        console.error('Error al cargar reservación:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarInicial();

    // Escuchar cambios en tiempo real
    const subscription = supabase
      .from('reservaciones')
      .on('UPDATE', (payload) => {
        if (payload.new.id === reservacionId) {
          // Cargar nuevamente para obtener los datos completos (incluyendo relaciones)
          supabase
            .from('reservaciones')
            .select(`
              *,
              choferes (*),
              clientes (*)
            `)
            .eq('id', reservacionId)
            .single()
            .then(({ data }) => {
              if (data) setReservacion(data as ReservacionEnVivo);
            });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [reservacionId]);

  return { reservacion, cargando, error };
}

/**
 * Hook para escuchar cambios en todas las reservaciones de un cliente
 */
export function useReservacionesClienteEnVivo(clienteId: string) {
  const [reservaciones, setReservaciones] = useState<ReservacionEnVivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!clienteId) {
      setCargando(false);
      return;
    }

    // Cargar reservaciones iniciales
    const cargarInicial = async () => {
      try {
        setCargando(true);
        const { data, error: err } = await supabase
          .from('reservaciones')
          .select(`
            *,
            choferes (*),
            clientes (*)
          `)
          .eq('cliente_id', clienteId)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setReservaciones((data || []) as ReservacionEnVivo[]);
        setError(null);
      } catch (err) {
        setError(err);
        console.error('Error al cargar reservaciones:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarInicial();

    // Escuchar cambios en tiempo real
    const subscription = supabase
      .from('reservaciones')
      .on('*', (payload) => {
        if (payload.new?.cliente_id === clienteId) {
          // Recargar todas las reservaciones
          cargarInicial();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [clienteId]);

  return { reservaciones, cargando, error };
}

/**
 * Hook para escuchar cambios en todas las reservaciones de un chofer
 */
export function useReservacionesChoferEnVivo(choferId: string) {
  const [reservaciones, setReservaciones] = useState<ReservacionEnVivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!choferId) {
      setCargando(false);
      return;
    }

    const cargarInicial = async () => {
      try {
        setCargando(true);
        const { data, error: err } = await supabase
          .from('reservaciones')
          .select(`
            *,
            choferes (*),
            clientes (*)
          `)
          .eq('chofer_id', choferId)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setReservaciones((data || []) as ReservacionEnVivo[]);
        setError(null);
      } catch (err) {
        setError(err);
        console.error('Error al cargar reservaciones:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarInicial();

    const subscription = supabase
      .from('reservaciones')
      .on('*', (payload) => {
        if (payload.new?.chofer_id === choferId || payload.old?.chofer_id === choferId) {
          cargarInicial();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [choferId]);

  return { reservaciones, cargando, error };
}
