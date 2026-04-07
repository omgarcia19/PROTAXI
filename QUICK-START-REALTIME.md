# Integración Rápida - Sistema de Actualización en Tiempo Real

## Para Cliente (actualización instantánea cuando se asigna chofer)

### Opción 1: Componente Simple (MÁS FÁCIL)

En tu página de "Mis Viajes" o "Dashboard Cliente":

```tsx
import { useReservacionesClienteEnVivo } from '@/hooks/useReservacionesEnVivo';
import MonitoreoViajeEnVivo from '@/components/taxiya/MonitoreoViajeEnVivo';

export default function MisViajes({ clienteId }) {
  const { reservaciones, cargando } = useReservacionesClienteEnVivo(clienteId);

  if (cargando) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      {reservaciones.length === 0 ? (
        <p>No tienes viajes</p>
      ) : (
        reservaciones.map(r => (
          <MonitoreoViajeEnVivo key={r.id} reservacionId={r.id} />
        ))
      )}
    </div>
  );
}
```

### Opción 2: Hook Directo (si necesitas más control)

```tsx
import { useReservacionEnVivo } from '@/hooks/useReservacionesEnVivo';

export default function DetallViaje({ viajeId }) {
  const { reservacion, cargando } = useReservacionEnVivo(viajeId);

  if (cargando) return <div>Cargando...</div>;
  if (!reservacion) return <div>No encontrado</div>;

  return (
    <div>
      <h2>{reservacion.domicilio_origen}</h2>
      <p>Estado: {reservacion.estatus}</p>
      
      {/* SE ACTUALIZA AUTOMÁTICAMENTE */}
      {reservacion.choferes ? (
        <div className="bg-green-100 p-4 rounded">
          <p><strong>{reservacion.choferes.nombre}</strong></p>
          <p>📞 {reservacion.choferes.telefono}</p>
          <p>🚗 {reservacion.choferes.marca} {reservacion.choferes.modelo}</p>
          <p>📍 Placas: {reservacion.choferes.placas}</p>
        </div>
      ) : (
        <p className="text-yellow-600">Buscando chofer...</p>
      )}
    </div>
  );
}
```

---

## Para Chofer (ver viajes disponibles y confirmar)

### Paso 1: Mostrar viajes disponibles

```tsx
import ViajesDisponibles from '@/components/taxiya/ViajesDisponibles';

export default function DashboardChofer({ choferId }) {
  return (
    <>
      <h1>Viajes Disponibles</h1>
      <ViajesDisponibles choferId={choferId} />
    </>
  );
}
```

### Paso 2: El componente automáticamente:
- ✅ Carga viajes pendientes
- ✅ Muestra botón "Confirmar Viaje"
- ✅ Al hacer clic, ejecuta `confirmarViajeChofer()` que:
  - Asigna el chofer a la reservación
  - Cambia estatus a "confirmada"
  - Marca al chofer como NO disponible

---

## Flujo Completo - Paso a Paso

### 1️⃣ Cliente crea reservación

```tsx
import { crearReservacionSupabase } from '@/utils/supabase-reservaciones';

const nuevaReservacion = {
  id: generarId(),
  cliente_id: clienteId,
  fecha: '2026-04-06',
  hora: '14:30',
  domicilio_origen: 'Calle principal 123',
  domicilio_destino: 'Avenida reforma 456',
  estatus: 'pendiente',
  timestamp: Date.now()
};

await crearReservacionSupabase(nuevaReservacion);
```

### 2️⃣ Cliente ve "Buscando chofer"

```tsx
<MonitoreoViajeEnVivo reservacionId={viajeId} />
// Muestra: "Buscando chofer disponible..."
```

### 3️⃣ Chofer ve viaje disponible

```tsx
<ViajesDisponibles choferId={choferId} />
// Muestra: Botón "Confirmar Viaje"
```

### 4️⃣ Chofer confirma

```tsx
// El componente hace esto automáticamente al hacer clic:
await confirmarViajeChofer(viajeId, choferId);
// - Asigna chofer_id
// - Cambia a "confirmada"
// - Marca chofer como no disponible
```

### 5️⃣ ✨ Cliente VE AUTOMÁTICAMENTE:

```
"¡Tu chofer ha sido asignado!"

Nombre: Carlos Mendoza
📞 665-123-4567
🚗 Nissan Sentra
📍 TAX-ARD98G

Estado: ✅ Confirmado
```

---

## Archivos nuevos que tienes

```
src/
├── hooks/
│   └── useReservacionesEnVivo.ts          ← Hooks para realtime
├── components/taxiya/
│   ├── MonitoreoViajeEnVivo.tsx           ← Componente para cliente
│   ├── ViajesDisponibles.tsx              ← Componente para chofer
│   └── DashboardClienteConRealtimeEjemplo.tsx  ← Ejemplo completo
└── utils/
    └── supabase-reservaciones.ts          ← Funciones auxiliares
```

---

## Funciones disponibles

### Para confirmación:
```typescript
// En supabase-reservaciones.ts

// Chofer confirma viaje (marca chofer como NO disponible)
await confirmarViajeChofer(reservacionId, choferId);

// Liberar chofer para otro viaje
await liberarChofer(choferId);

// Cambiar estado del viaje
await actualizarEstatusReservacion(reservacionId, 'en_camino');

// Completar viaje y liberar chofer
await completarReservacion(reservacionId, costo, duracion, distancia);

// Cancelar viaje y liberar chofer
await cancelarReservacion(reservacionId);
```

### Para queries:
```typescript
// Obtener viajes pendientes
const viajes = await obtenerReservacionesPendientes();

// Obtener viajes de un cliente (con actualización en vivo)
const { reservaciones } = useReservacionesClienteEnVivo(clienteId);

// Obtener viajes de un chofer (con actualización en vivo)
const { reservaciones } = useReservacionesChoferEnVivo(choferId);
```

---

## Testing Local

1. **Terminal 1:** Client
   ```
   npm run dev
   http://localhost:8080
   ```

2. **Abre en 2 navegadores:**
   - Navegador A: http://localhost:8080?tipo=cliente
   - Navegador B: http://localhost:8080?tipo=chofer

3. **Cliente:**
   - Crea una reservación
   - Verás "Buscando chofer disponible..."

4. **Chofer:**
   - Abre "Viajes Disponibles"
   - Verás el viaje que creó el cliente
   - Hace clic en "Confirmar Viaje"

5. **Cliente:**
   - ✨ **¡VE INSTANTÁNEAMENTE LOS DATOS DEL CHOFER!** ✨
   - Sin recargar, sin esperar

---

## Troubleshooting

❌ **"No funciona en tiempo real"**
```
Solución: Verifica que:
1. Supabase Realtime esté ON en tu proyecto
2. Las tablas tengan los datos correctos
3. No hay RLS bloqueando los SELECTs
```

❌ **"TypeError: Cannot read property 'choferes'"**
```
Solución: Usa:
if (reservacion?.choferes) { ... }
// Espera a que cargue
```

❌ **"Las conexiones se cierran"**
```
Solución: Normal. Se reconecta automáticamente.
Si hay problemas de conexión, verifica tu internet.
```

---

## Siguientes Pasos

✅ Integra `useReservacionesClienteEnVivo` en tu DashboardCliente  
✅ Reemplaza la lista de reservaciones estática por dinámica  
✅ Agrega `MonitoreoViajeEnVivo` para mostrar detalles  
✅ Prueba con 2 navegadores (cliente + chofer)  
✅ Activa RLS en producción (opcional pero recomendado)  

¡Listo! Tu app ahora tiene actualización en tiempo real 🚀
