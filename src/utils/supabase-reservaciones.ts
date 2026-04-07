import { supabase } from './supabase';
import { cambiarDisponibilidad } from './supabase-choferes';
import type { Reservacion } from '@/lib/taxiya-store';

export interface ReservacionDB {
  id?: string;
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
}

export async function crearReservacionSupabase(r: Reservacion): Promise<boolean> {
  try {
    // Buscar el cliente_id por teléfono
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefono', r.clienteTelefono)
      .single();

    if (clienteError || !clienteData) {
      console.error('Error al buscar cliente por teléfono:', clienteError);
      return false;
    }

    const { error } = await supabase
      .from('reservaciones')
      .insert({
        cliente_id: clienteData.id,
        fecha: r.fecha,
        hora: r.hora,
        domicilio_origen: r.domicilio,
        lat_origen: r.coordenadas?.lat,
        lon_origen: r.coordenadas?.lon,
        notas: r.notas,
        estatus: r.estatus,
        timestamp: r.timestamp,
      });

    if (error) {
      console.error('Error al crear reservación en Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

export async function obtenerReservacionesSupabase(): Promise<Reservacion[]> {
  try {
    const { data, error } = await supabase
      .from('reservaciones')
      .select('*, cliente:clientes(nombre, telefono), chofer:choferes(nombre, telefono, placas, marca, modelo, foto_perfil)')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error al obtener reservaciones:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      clienteNombre: row.cliente?.nombre || '',
      clienteTelefono: row.cliente?.telefono || '',
      fecha: row.fecha,
      hora: row.hora,
      domicilio: row.domicilio_origen,
      coordenadas: row.lat_origen && row.lon_origen ? { lat: row.lat_origen, lon: row.lon_origen } : null,
      notas: row.notas,
      estatus: row.estatus,
      choferAsignado: row.chofer ? {
        nombre: row.chofer.nombre,
        placas: row.chofer.placas,
        marca: row.chofer.marca,
        modelo: row.chofer.modelo,
        foto: row.chofer.foto_perfil || '',
        telefono: row.chofer.telefono || '',
      } : null,
      timestamp: row.timestamp,
    }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export async function actualizarEstatusReservacionSupabase(
  id: string,
  nuevoEstatus: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reservaciones')
      .update({
        estatus: nuevoEstatus,
      })
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar estatus:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

export async function confirmarReservacionSupabase(
  id: string,
  choferPlacas: string
): Promise<boolean> {
  try {
    // Buscar chofer_id por placas
    const { data: choferData, error: choferError } = await supabase
      .from('choferes')
      .select('id')
      .eq('placas', choferPlacas)
      .single();

    if (choferError || !choferData) {
      console.error('Error al buscar chofer por placas:', choferError);
      return false;
    }

    const { error } = await supabase
      .from('reservaciones')
      .update({
        estatus: 'confirmada',
        chofer_id: choferData.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('estatus', 'pendiente');

    if (error) {
      console.error('Error al confirmar reservación:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Listener en tiempo real para cambios
export function escucharReservacionesEnTiempoReal(
  callback: (reservaciones: Reservacion[]) => void
) {
  const subscription = supabase
    .from('reservaciones')
    .on('*', async (payload) => {
      console.log('Cambio en reservaciones:', payload);
      const reservaciones = await obtenerReservacionesSupabase();
      callback(reservaciones);
    })
    .subscribe();

  return subscription;
}

// ==========================================
// NUEVAS FUNCIONES NORMALIZADAS
// ==========================================

/**
 * Confirmar viaje: Asigna un chofer a la reservación y lo marca como no disponible
 * @param reservacionId - ID de la reservación
 * @param choferId - ID del chofer
 * @returns { success: boolean, error?: any }
 */
export async function confirmarViajeChofer(
  reservacionId: string,
  choferId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    // 1. Actualizar la reservación: asignar chofer y cambiar estado a "confirmada"
    const { error: errorReservacion } = await supabase
      .from('reservaciones')
      .update({
        chofer_id: choferId,
        estatus: 'confirmada',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservacionId)
      .eq('estatus', 'pendiente'); // Solo si está pendiente

    if (errorReservacion) {
      console.error('Error al confirmar reservación:', errorReservacion);
      return { success: false, error: errorReservacion };
    }

    // 2. Cambiar disponibilidad del chofer a false (no disponible)
    const resultDisponibilidad = await cambiarDisponibilidad(choferId, false);
    
    if (resultDisponibilidad.error) {
      console.error('Error al cambiar disponibilidad del chofer:', resultDisponibilidad.error);
      // No retornar error aquí porque la reservación ya fue actualizada
    }

    console.log('✅ Viaje confirmado y chofer marcado como no disponible');
    return { success: true };
  } catch (error) {
    console.error('Error al confirmar viaje:', error);
    return { success: false, error };
  }
}

/**
 * Liberar chofer: Marca el chofer como disponible cuando completa un viaje
 * @param choferId - ID del chofer
 */
export async function liberarChofer(choferId: string): Promise<{ success: boolean; error?: any }> {
  try {
    const result = await cambiarDisponibilidad(choferId, true);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    console.log('✅ Chofer liberado y marcado como disponible');
    return { success: true };
  } catch (error) {
    console.error('Error al liberar chofer:', error);
    return { success: false, error };
  }
}

/**
 * Obtener reservaciones pendientes (sin chofer asignado)
 */
export async function obtenerReservacionesPendientes(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('reservaciones')
      .select(`
        *,
        clientes (*)
      `)
      .eq('estatus', 'pendiente')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error al obtener reservaciones pendientes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Obtener reservaciones por cliente
 */
export async function obtenerReservacionesPorCliente(clienteId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('reservaciones')
      .select(`
        *,
        choferes (*)
      `)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener reservaciones del cliente:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Obtener reservaciones por chofer
 */
export async function obtenerReservacionesPorChofer(choferId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('reservaciones')
      .select(`
        *,
        clientes (*)
      `)
      .eq('chofer_id', choferId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener reservaciones del chofer:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Actualizar estado de la reservación
 */
export async function actualizarEstatusReservacion(
  reservacionId: string,
  nuevoEstatus: 'pendiente' | 'confirmada' | 'en_camino' | 'completada' | 'cancelada'
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('reservaciones')
      .update({
        estatus: nuevoEstatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservacionId);

    if (error) {
      console.error('Error al actualizar estado:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}

/**
 * Cancelar reservación y liberar chofer si estaba asignado
 */
export async function cancelarReservacion(reservacionId: string): Promise<{ success: boolean; error?: any }> {
  try {
    // 1. Obtener la reservación para ver si tiene chofer asignado
    const { data: reservacion, error: errorObtener } = await supabase
      .from('reservaciones')
      .select('chofer_id')
      .eq('id', reservacionId)
      .single();

    if (errorObtener) {
      return { success: false, error: errorObtener };
    }

    // 2. Actualizar estado a cancelada
    const { error: errorActualizar } = await supabase
      .from('reservaciones')
      .update({
        estatus: 'cancelada',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservacionId);

    if (errorActualizar) {
      return { success: false, error: errorActualizar };
    }

    // 3. Si hay chofer asignado, marcarlo como disponible
    if (reservacion?.chofer_id) {
      await liberarChofer(reservacion.chofer_id);
    }

    console.log('✅ Reservación cancelada');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}

/**
 * Completar reservación: cambiar estado a "completada" y liberar chofer
 */
export async function completarReservacion(
  reservacionId: string,
  costo?: number,
  duracionMinutos?: number,
  distanciaKm?: number
): Promise<{ success: boolean; error?: any }> {
  try {
    // 1. Obtener la reservación
    const { data: reservacion, error: errorObtener } = await supabase
      .from('reservaciones')
      .select('chofer_id')
      .eq('id', reservacionId)
      .single();

    if (errorObtener) {
      return { success: false, error: errorObtener };
    }

    // 2. Actualizar estado a "completada"
    const { error: errorActualizar } = await supabase
      .from('reservaciones')
      .update({
        estatus: 'completada',
        costo,
        duracion_minutos: duracionMinutos,
        distancia_km: distanciaKm,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservacionId);

    if (errorActualizar) {
      return { success: false, error: errorActualizar };
    }

    // 3. Liberar chofer para que pueda tomar otro viaje
    if (reservacion?.chofer_id) {
      await liberarChofer(reservacion.chofer_id);
    }

    console.log('✅ Reservación completada');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}
