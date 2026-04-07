# Configuración de Base de Datos - Taxiya

## Instrucciones para crear las tablas en Supabase

### Paso 1: Acceder a Supabase
1. Ve a [supabase.com](https://supabase.com) y accede a tu proyecto
2. Ve a la sección **SQL Editor**

### Paso 2: Crear las tablas de Clientes y Choferes

#### Opción A: Copiar y pegar todo el contenido

Copia el contenido completo de `SUPABASE_SETUP.sql` y pega en el SQL Editor de Supabase, luego ejecuta.

#### Opción B: Ejecutar línea por línea

1. **Primero**: Crea las tablas base (clientes, choferes, reservaciones, calificaciones)
   - Copia todo el contenido de `SUPABASE_SETUP.sql`
   - Pega y ejecuta

2. **Luego** (opcional): Agrega datos de prueba
   - Copia el contenido de `SEED_DATA.sql`
   - Pega y ejecuta

### Paso 3: Verificar las tablas creadas

En Supabase, en la sección **Table Editor**, deberías ver las siguientes tablas:

- ✅ `clientes` - Información de clientes
- ✅ `choferes` - Información de choferes
- ✅ `reservaciones` - Registro de reservaciones (normalizado)
- ✅ `calificaciones` - Calificaciones de viajes

### Paso 4: Configurar RLS (Row Level Security) - Opcional

Para seguridad en producción, ejecuta estos comandos en el SQL Editor:

```sql
-- Habilitar RLS en tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE choferes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas (todos pueden ver)
CREATE POLICY "Clientes pueden ser vistos por todos"
ON clientes FOR SELECT
USING (true);

CREATE POLICY "Choferes pueden ser vistos por todos"
ON choferes FOR SELECT
USING (true);
```

## Estructura de Datos

### Tabla: Clientes
```
- id: UUID (clave primaria)
- nombre: TEXT
- telefono: TEXT (único)
- email: TEXT
- domicilio: TEXT
- ciudad: TEXT
- estado: TEXT
- codigo_postal: TEXT
- calificacion: FLOAT (1-5)
- numero_viajes: INTEGER
- estado_cliente: TEXT ('activo', 'inactivo', 'suspendido')
- foto_perfil: TEXT (URL)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabla: Choferes
```
- id: UUID (clave primaria)
- nombre: TEXT
- telefono: TEXT (único)
- email: TEXT
- placas: TEXT (único)
- marca: TEXT
- modelo: TEXT
- año: INTEGER
- color: TEXT
- numero_economico: TEXT
- foto_perfil: TEXT (URL)
- foto_licencia: TEXT (URL)
- foto_vehiculo: TEXT (URL)
- licencia_numero: TEXT
- licencia_expiracion: DATE
- calificacion: FLOAT (1-5)
- numero_viajes: INTEGER
- estado_chofer: TEXT ('activo', 'inactivo', 'suspendido')
- disponible: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabla: Reservaciones
```
- id: UUID (clave primaria)
- cliente_id: UUID (FK)
- chofer_id: UUID (FK, nullable)
- fecha: TEXT
- hora: TEXT
- domicilio_origen: TEXT
- domicilio_destino: TEXT
- lat_origen: FLOAT
- lon_origen: FLOAT
- lat_destino: FLOAT
- lon_destino: FLOAT
- notas: TEXT
- estatus: TEXT ('pendiente', 'confirmada', 'en_camino', 'completada', 'cancelada')
- costo: FLOAT
- duracion_minutos: INTEGER
- distancia_km: FLOAT
- timestamp: BIGINT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabla: Calificaciones
```
- id: UUID (clave primaria)
- reservacion_id: UUID (FK)
- cliente_id: UUID (FK, nullable)
- chofer_id: UUID (FK, nullable)
- calificacion_cliente: INTEGER (1-5)
- calificacion_chofer: INTEGER (1-5)
- comentario: TEXT
- created_at: TIMESTAMP
```

## Funciones disponibles en el código

### Para Clientes (`supabase-clientes.ts`)
- `crearCliente()` - Crear nuevo cliente
- `obtenerClientePorId()` - Obtener cliente por ID
- `obtenerClientePorTelefono()` - Obtener cliente por teléfono
- `obtenerTodosLosClientes()` - Obtener todos los clientes
- `actualizarCliente()` - Actualizar datos del cliente
- `actualizarCalificacionCliente()` - Actualizar calificación
- `incrementarViajesCliente()` - Incrementar contador de viajes
- `eliminarCliente()` - Eliminar cliente
- `cambiarEstadoCliente()` - Cambiar estado (activo/inactivo/suspendido)

### Para Choferes (`supabase-choferes.ts`)
- `crearChofer()` - Crear nuevo chofer
- `obtenerChoferPorId()` - Obtener chofer por ID
- `obtenerChoferPorTelefono()` - Obtener chofer por teléfono
- `obtenerChoferPorPlacas()` - Obtener chofer por placas
- `obtenerTodosLosChoferes()` - Obtener todos los choferes
- `obtenerChoferesDisponibles()` - Obtener solo choferes disponibles
- `actualizarChofer()` - Actualizar datos del chofer
- `cambiarDisponibilidad()` - Cambiar si está disponible o no
- `actualizarCalificacionChofer()` - Actualizar calificación
- `incrementarViajesChofer()` - Incrementar contador de viajes
- `eliminarChofer()` - Eliminar chofer
- `cambiarEstadoChofer()` - Cambiar estado

## Datos de prueba incluidos

Se incluyen 8 clientes y 8 choferes de ejemplo para pruebas.

### Clientes de ejemplo:
- Marco Antonio: 6614682033
- Gilda García: 6534907999
- Roberto López: 6564682712
- María Rodríguez: 6545821903
- Juan Martínez: 6565934201
- Patricia Sánchez: 6567845123
- Luis Fernández: 6568901234
- Carmen López: 6569012345

### Choferes de ejemplo:
- Carlos Mendoza: Placas TAX-ARD98G
- Diego Sánchez: Placas TAX-BTD03_9
- Fernando García: Placas TAX-GVG341
- Arturo Ramírez: Placas TAX-PRD941A
- Roberto Acosta: Placas TAX-XYZ789
- Miguel Rodríguez: Placas TAX-ABC456
- Víctor González: Placas TAX-DEF123
- Sergio López: Placas TAX-GHI789

## Notas importantes

⚠️ **NO ejecutes estos scripts directamente en Terminal/CLI**. Debes:
1. Ir a Supabase Dashboard
2. Abrir SQL Editor
3. Pegar el contenido de los archivos .sql
4. Hacer clic en "Run"

Los datos de prueba contienen teléfonos y placas únicos. Si ejecutas SEED_DATA.sql más de una vez, obtendrás errores de violación de unicidad.
