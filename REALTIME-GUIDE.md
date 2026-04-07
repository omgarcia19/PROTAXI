# Sistema de Actualización en Tiempo Real - TaxiYa

## ¿Qué se agregó?

Se implementó un sistema completo de **actualización en vivo** usando **Supabase Realtime**. Cuando un chofer confirma un viaje, el cliente ve **instantáneamente** la información del chofer asignado en su pantalla.

## Componentes Nuevos

### 1. **Hook: `useReservacionEnVivo`** (`src/hooks/useReservacionesEnVivo.ts`)

Escucha cambios en tiempo real de una reservación específica:

```typescript
import { useReservacionEnVivo } from '@/hooks/useReservacionesEnVivo';

// En tu componente
const { reservacion, cargando, error } = useReservacionEnVivo(reservacionId);

// Cuando el chofer confirma, reservacion.choferes se actualiza automáticamente
```

**Hooks disponibles:**
- `useReservacionEnVivo(reservacionId)` - Monitorea 1 reservación
- `useReservacionesClienteEnVivo(clienteId)` - Monitorea todas las del cliente
- `useReservacionesChoferEnVivo(choferId)` - Monitorea todas las del chofer

### 2. **Componente: `MonitoreoViajeEnVivo`** (`src/components/taxiya/MonitoreoViajeEnVivo.tsx`)

Componente que muestra el estado del viaje **EN TIEMPO REAL**:

```typescript
import MonitoreoViajeEnVivo from '@/components/taxiya/MonitoreoViajeEnVivo';

// En tu componente
<MonitoreoViajeEnVivo reservacionId={viajeId} />
```

**Características:**
- ✅ Muestra estado del viaje (Pendiente → Confirmada → En camino → Completada)
- ✅ **Actualiza automáticamente cuando se asigna un chofer**
- ✅ Muestra datos del chofer: nombre, teléfono, marca/modelo, placas, calificación
- ✅ Notificación visual cuando se asigna el chofer
- ✅ Muestra costo, distancia y duración si están disponibles

### 3. **Componente: `ViajesDisponibles`** (`src/components/taxiya/ViajesDisponibles.tsx`)

Ya incluye:
- Carga de viajes pendientes
- Botón para confirmar viaje
- **Automáticamente marca al chofer como no disponible** cuando confirma

## Flujo Completo

```
1. Cliente crea reservación (estado: "pendiente")
   ↓
2. Cliente ve "Buscando chofer disponible..." en MonitoreoViajeEnVivo
   ↓
3. Chofer ve el viaje en ViajesDisponibles
   ↓
4. Chofer presiona "Confirmar Viaje"
   ↓
5. Se ejecuta confirmarViajeChofer() que:
   - Asigna el chofer_id a la reservación
   - Cambia estatus a "confirmada"
   - Marca al chofer como no disponible
   ↓
6. ✅ Supabase Realtime notifica al cliente automáticamente
   ↓
7. Cliente VE INSTANTÁNEAMENTE:
   - Cambio de estado "Pendiente" → "Confirmada"
   - Datos del chofer (nombre, auto, placas, teléfono)
   - Notificación "¡Tu chofer ha sido asignado!"
```

## Cómo integrar en tu código existente

### Opción A: Reemplazar lista de reservaciones con monitoreo en vivo

**Antes:**
```typescript
const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);
// Actualizar manualmente cada vez
```

**Después:**
```typescript
import { useReservacionesClienteEnVivo } from '@/hooks/useReservacionesEnVivo';

const { reservaciones, cargando } = useReservacionesClienteEnVivo(clienteId);
// ¡Se actualiza automáticamente!
```

### Opción B: Mostrar un viaje específico

En **DashboardCliente.tsx**, agregar el monitoreo:

```typescript
import MonitoreoViajeEnVivo from '@/components/taxiya/MonitoreoViajeEnVivo';

// En el renderizado
{reservaciones.map((r) => (
  <div key={r.id}>
    <MonitoreoViajeEnVivo reservacionId={r.id} />
  </div>
))}
```

### Opción C: Dashboard de chofer con viajes

```typescript
import { useReservacionesChoferEnVivo } from '@/hooks/useReservacionesEnVivo';
import ViajesDisponibles from '@/components/taxiya/ViajesDisponibles';

export default function DashboardChofer({ choferId }: Props) {
  const { reservaciones } = useReservacionesChoferEnVivo(choferId);
  
  return (
    <>
      <ViajesDisponibles choferId={choferId} />
      
      {/* Mostrar viajes asignados */}
      {reservaciones.map(viaje => (
        <MonitoreoViajeEnVivo key={viaje.id} reservacionId={viaje.id} />
      ))}
    </>
  );
}
```

## Funciones Auxiliares (supabase-reservaciones.ts)

### Confirmar Viaje (usa el chofer)
```typescript
await confirmarViajeChofer(reservacionId, choferId);
// - Asigna chofer
// - Cambia estatus a "confirmada"
// - Marca chofer como NO disponible
```

### Completar Viaje
```typescript
await completarReservacion(reservacionId, costo, duracion, distancia);
// - Cambia a "completada"
// - Libera chofer (marca como disponible)
```

### Cancelar Viaje
```typescript
await cancelarReservacion(reservacionId);
// - Cambia a "cancelada"
// - Libera chofer si estaba asignado
```

### Liberar Chofer
```typescript
await liberarChofer(choferId);
// - Marca chofer como disponible
// - Puede tomar otro viaje
```

## Ventajas del Sistema

✅ **Actualización instantánea** - Sin necesidad de refrescar la página  
✅ **Escalable** - Soporta muchas conexiones simultáneas  
✅ **Confiable** - Usa conexión nativa de Supabase  
✅ **Eficiente** - Solo carga datos cuando cambian  
✅ **Responsive** - Notificaciones visuales automáticas  
✅ **Normalizado** - BD con relaciones FK y UUID  

## Requisitos en Supabase

Asegúrate de que:

1. ✅ Tabla `reservaciones` exista (con `chofer_id` FK)
2. ✅ Tabla `choferes` exista
3. ✅ Tabla `clientes` exista
4. ✅ Realtime esté activado en Supabase (por defecto está ON)

## Testing

Para probar:

1. Abre 2 navegadores: uno como **cliente**, otro como **chofer**
2. Cliente crea reservación → ve "Buscando chofer..."
3. Chofer abre ViajesDisponibles → ve el viaje disponible
4. Chofer hace clic en "Confirmar Viaje"
5. **¡Cliente ve el cambio INSTANTÁNEAMENTE!** ✨

## Notas Importantes

⚠️ **Supabase Realtime:**
- Los cambios se sincronizan en **todos los clientes conectados**
- Si cierran la app, la próxima vez que abra verá el estado actual
- Las notificaciones se pierden si la conexión se desconecta (pero se re-sincroniza)

⚠️ **Performance:**
- Si hay muchos viajes, limita con `order()` y `limit()`
- Usa índices en Supabase para queries rápidas

⚠️ **Seguridad:**
- Activa RLS (Row Level Security) en producción
- Solo clientes pueden ver sus propias reservaciones
- Solo choferes ven viajes disponibles
