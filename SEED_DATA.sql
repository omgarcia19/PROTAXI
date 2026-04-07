-- Script para insertar datos de prueba en las tablas de clientes y choferes

-- Insertar datos de muestra de clientes
INSERT INTO clientes (nombre, telefono, email, domicilio, ciudad, estado, codigo_postal, calificacion, numero_viajes, estado_cliente, foto_perfil) VALUES
('Marco Antonio', '6614682033', 'marco@example.com', 'Calle Principal 123', 'Juárez', 'Chihuahua', '32000', 4.8, 15, 'activo', NULL),
('Gilda García', '6534907999', 'gilda@example.com', 'Avenida Reforma 456', 'El Paso', 'Texas', '79901', 5.0, 8, 'activo', NULL),
('Roberto López', '6564682712', 'roberto@example.com', 'Calle 5 de Mayo 789', 'Juárez', 'Chihuahua', '32000', 4.5, 12, 'activo', NULL),
('María Rodríguez', '6545821903', 'maria@example.com', 'Boulevard América 321', 'Las Cruces', 'Nuevo México', '88001', 4.9, 20, 'activo', NULL),
('Juan Martínez', '6565934201', 'juan@example.com', 'Paseo de la Reforma 654', 'Juárez', 'Chihuahua', '32000', 4.7, 18, 'activo', NULL),
('Patricia Sánchez', '6567845123', 'patricia@example.com', 'Calle Insurgentes 987', 'Juárez', 'Chihuahua', '32000', 5.0, 25, 'activo', NULL),
('Luis Fernández', '6568901234', 'luis@example.com', 'Avenida Paseo Central 111', 'Juárez', 'Chihuahua', '32000', 4.6, 10, 'activo', NULL),
('Carmen López', '6569012345', 'carmen@example.com', 'Calle Comercio 222', 'Juárez', 'Chihuahua', '32000', 4.8, 14, 'activo', NULL);

-- Insertar datos de muestra de choferes
INSERT INTO choferes (nombre, telefono, email, placas, marca, modelo, año, color, numero_economico, foto_perfil, foto_licencia, foto_vehiculo, licencia_numero, licencia_expiracion, calificacion, numero_viajes, estado_chofer, disponible) VALUES
('Carlos Mendoza', '6551234567', 'carlos@example.com', 'TAX-ARD98G', 'Nissan', 'Sentra', 2022, 'Blanco', '001', NULL, NULL, NULL, 'LIC-001', '2027-06-15', 4.9, 145, 'activo', true),
('Diego Sánchez', '6552345678', 'diego@example.com', 'TAX-BTD03_9', 'Toyota', 'Corolla', 2021, 'Plateado', '002', NULL, NULL, NULL, 'LIC-002', '2026-09-20', 4.7, 128, 'activo', true),
('Fernando García', '6553456789', 'fernando@example.com', 'TAX-GVG341', 'Hyundai', 'Elantra', 2023, 'Negro', '003', NULL, NULL, NULL, 'LIC-003', '2028-03-10', 4.8, 156, 'activo', false),
('Arturo Ramírez', '6554567890', 'arturo@example.com', 'TAX-PRD941A', 'Nissan', 'Tsuru', 2020, 'Rojo', '004', NULL, NULL, NULL, 'LIC-004', '2025-12-05', 4.6, 132, 'activo', true),
('Roberto Acosta', '6555678901', 'roberto@example.com', 'TAX-XYZ789', 'Ford', 'Focus', 2022, 'Azul', '005', NULL, NULL, NULL, 'LIC-005', '2027-01-30', 4.9, 167, 'activo', true),
('Miguel Rodríguez', '6556789012', 'miguel@example.com', 'TAX-ABC456', 'Chevrolet', 'Aveo', 2021, 'Gris', '006', NULL, NULL, NULL, 'LIC-006', '2026-07-15', 4.8, 151, 'activo', true),
('Víctor González', '6557890123', 'victor@example.com', 'TAX-DEF123', 'Volkswagen', 'Jetta', 2023, 'Blanco', '007', NULL, NULL, NULL, 'LIC-007', '2028-11-22', 4.7, 139, 'inactivo', false),
('Sergio López', '6558901234', 'sergio@example.com', 'TAX-GHI789', 'Honda', 'Civic', 2022, 'Negro', '008', NULL, NULL, NULL, 'LIC-008', '2027-04-18', 4.9, 174, 'activo', true);
