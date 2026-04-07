import { supabase } from './supabase';

export interface Cliente {
  id?: string;
  nombre: string;
  telefono: string;
  email?: string;
  domicilio?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  calificacion?: number;
  numero_viajes?: number;
  estado_cliente?: string;
  foto_perfil?: string;
  created_at?: string;
  updated_at?: string;
}

// Crear nuevo cliente
export async function crearCliente(cliente: Cliente) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return { data: null, error };
  }
}

// Obtener cliente por ID
export async function obtenerClientePorId(clienteId: string) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return { data: null, error };
  }
}

// Obtener cliente por teléfono
export async function obtenerClientePorTelefono(telefono: string) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefono', telefono)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener cliente por teléfono:', error);
    return { data: null, error };
  }
}

// Obtener todos los clientes
export async function obtenerTodosLosClientes() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return { data: null, error };
  }
}

// Actualizar cliente
export async function actualizarCliente(clienteId: string, updates: Partial<Cliente>) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clienteId)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return { data: null, error };
  }
}

// Actualizar calificación del cliente
export async function actualizarCalificacionCliente(
  clienteId: string,
  nuevaCalificacion: number
) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update({ calificacion: nuevaCalificacion })
      .eq('id', clienteId)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al actualizar calificación:', error);
    return { data: null, error };
  }
}

// Incrementar número de viajes
export async function incrementarViajesCliente(clienteId: string) {
  try {
    const cliente = await obtenerClientePorId(clienteId);
    const nuevoNumero = (cliente.data?.numero_viajes || 0) + 1;

    const { data, error } = await supabase
      .from('clientes')
      .update({ numero_viajes: nuevoNumero })
      .eq('id', clienteId)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al incrementar viajes:', error);
    return { data: null, error };
  }
}

// Eliminar cliente
export async function eliminarCliente(clienteId: string) {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', clienteId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return { error };
  }
}

// Cambiar estado del cliente
export async function cambiarEstadoCliente(
  clienteId: string,
  nuevoEstado: 'activo' | 'inactivo' | 'suspendido'
) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update({ estado_cliente: nuevoEstado })
      .eq('id', clienteId)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    return { data: null, error };
  }
}
