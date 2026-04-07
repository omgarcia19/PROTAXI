import { supabase } from './supabase';

export interface Chofer {
  id?: string;
  nombre: string;
  telefono: string;
  email?: string;
  placas: string;
  marca: string;
  modelo: string;
  año?: number;
  color?: string;
  numero_economico?: string;
  foto_perfil?: string;
  foto_licencia?: string;
  foto_vehiculo?: string;
  licencia_numero?: string;
  licencia_expiracion?: string;
  calificacion?: number;
  numero_viajes?: number;
  estado_chofer?: string;
  disponible?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Crear nuevo chofer
export async function crearChofer(chofer: Chofer) {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .insert([chofer])
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al crear chofer:', error);
    return { data: null, error };
  }
}

// Obtener chofer por ID
export async function obtenerChoferPorId(choferId: string) {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .select('*')
      .eq('id', choferId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener chofer:', error);
    return { data: null, error };
  }
}

// Obtener chofer por teléfono
export async function obtenerChoferPorTelefono(telefono: string) {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .select('*')
      .eq('telefono', telefono)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener chofer por teléfono:', error);
    return { data: null, error };
  }
}

// Obtener chofer por placas
export async function obtenerChoferPorPlacas(placas: string) {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .select('*')
      .eq('placas', placas)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener chofer por placas:', error);
    return { data: null, error };
  }
}

// Obtener todos los choferes
export async function obtenerTodosLosChoferes() {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener choferes:', error);
    return { data: null, error };
  }
}

// Obtener choferes disponibles
export async function obtenerChoferesDisponibles() {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .select('*')
      .eq('disponible', true)
      .eq('estado_chofer', 'activo');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener choferes disponibles:', error);
    return { data: null, error };
  }
}

// Actualizar chofer
export async function actualizarChofer(choferId: string, updates: Partial<Chofer>) {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', choferId)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al actualizar chofer:', error);
    return { data: null, error };
  }
}

// Cambiar disponibilidad del chofer
export async function cambiarDisponibilidad(choferId: string, disponible: boolean) {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .update({ disponible })
      .eq('id', choferId)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al cambiar disponibilidad:', error);
    return { data: null, error };
  }
}

// Actualizar calificación del chofer
export async function actualizarCalificacionChofer(
  choferId: string,
  nuevaCalificacion: number
) {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .update({ calificacion: nuevaCalificacion })
      .eq('id', choferId)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al actualizar calificación:', error);
    return { data: null, error };
  }
}

// Incrementar número de viajes
export async function incrementarViajesChofer(choferId: string) {
  try {
    const chofer = await obtenerChoferPorId(choferId);
    const nuevoNumero = (chofer.data?.numero_viajes || 0) + 1;

    const { data, error } = await supabase
      .from('choferes')
      .update({ numero_viajes: nuevoNumero })
      .eq('id', choferId)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al incrementar viajes:', error);
    return { data: null, error };
  }
}

// Eliminar chofer
export async function eliminarChofer(choferId: string) {
  try {
    const { error } = await supabase
      .from('choferes')
      .delete()
      .eq('id', choferId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error al eliminar chofer:', error);
    return { error };
  }
}

// Cambiar estado del chofer
export async function cambiarEstadoChofer(
  choferId: string,
  nuevoEstado: 'activo' | 'inactivo' | 'suspendido'
) {
  try {
    const { data, error } = await supabase
      .from('choferes')
      .update({ estado_chofer: nuevoEstado })
      .eq('id', choferId)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    return { data: null, error };
  }
}
