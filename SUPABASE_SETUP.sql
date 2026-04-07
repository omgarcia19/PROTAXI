-- Crear tabla de clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL UNIQUE,
  email TEXT,
  domicilio TEXT,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  calificacion FLOAT DEFAULT 5.0,
  numero_viajes INTEGER DEFAULT 0,
  estado_cliente TEXT NOT NULL DEFAULT 'activo',
  foto_perfil TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de choferes
CREATE TABLE choferes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL UNIQUE,
  email TEXT,
  placas TEXT NOT NULL UNIQUE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  año INTEGER,
  color TEXT,
  numero_economico TEXT,
  foto_perfil TEXT,
  foto_licencia TEXT,
  foto_vehiculo TEXT,
  licencia_numero TEXT,
  licencia_expiracion DATE,
  calificacion FLOAT DEFAULT 5.0,
  numero_viajes INTEGER DEFAULT 0,
  estado_chofer TEXT NOT NULL DEFAULT 'activo',
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de reservaciones (normalizada)
CREATE TABLE reservaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL,
  chofer_id UUID,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  domicilio_origen TEXT NOT NULL,
  domicilio_destino TEXT,
  lat_origen FLOAT,
  lon_origen FLOAT,
  lat_destino FLOAT,
  lon_destino FLOAT,
  notas TEXT,
  estatus TEXT NOT NULL DEFAULT 'pendiente',
  costo FLOAT,
  duracion_minutos INTEGER,
  distancia_km FLOAT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (chofer_id) REFERENCES choferes(id) ON DELETE SET NULL
);

-- Crear tabla de calificaciones
CREATE TABLE calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservacion_id UUID NOT NULL,
  cliente_id UUID,
  chofer_id UUID,
  calificacion_cliente INTEGER CHECK (calificacion_cliente >= 1 AND calificacion_cliente <= 5),
  calificacion_chofer INTEGER CHECK (calificacion_chofer >= 1 AND calificacion_chofer <= 5),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (reservacion_id) REFERENCES reservaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  FOREIGN KEY (chofer_id) REFERENCES choferes(id) ON DELETE SET NULL
);

-- Crear índices para better performance
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_estado ON clientes(estado_cliente);

CREATE INDEX idx_choferes_telefono ON choferes(telefono);
CREATE INDEX idx_choferes_placas ON choferes(placas);
CREATE INDEX idx_choferes_disponible ON choferes(disponible);
CREATE INDEX idx_choferes_estado ON choferes(estado_chofer);

CREATE INDEX idx_reservaciones_cliente_id ON reservaciones(cliente_id);
CREATE INDEX idx_reservaciones_chofer_id ON reservaciones(chofer_id);
CREATE INDEX idx_reservaciones_estatus ON reservaciones(estatus);
CREATE INDEX idx_reservaciones_fecha ON reservaciones(fecha);

CREATE INDEX idx_calificaciones_reservacion ON calificaciones(reservacion_id);
CREATE INDEX idx_calificaciones_cliente ON calificaciones(cliente_id);
CREATE INDEX idx_calificaciones_chofer ON calificaciones(chofer_id);
