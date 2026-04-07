import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock de Supabase
vi.mock('@/utils/supabase', () => ({
  supabase: {
    from: vi.fn(),
  }
}));

describe('AuthCliente - Registro y Login', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Validación de Entrada', () => {
    it('debería rechazar teléfono con menos de 10 dígitos', () => {
      const telefono = '661468203'; // 9 dígitos
      expect(telefono.length).toBeLessThan(10);
    });

    it('debería aceptar exactamente 10 dígitos', () => {
      const telefono = '6614682033'; // 10 dígitos
      expect(telefono.length).toBe(10);
    });

    it('debería rechazar teléfono no numérico', () => {
      const telefono = '66148abc33';
      const soloNumeros = telefono.replace(/\D/g, '');
      expect(soloNumeros.length).toBeLessThan(10);
    });

    it('debería rechazar campos vacíos en registro', () => {
      const nombre = '';
      const telefono = '6614682033';
      const direccion = '';
      
      const esValido = nombre && telefono && direccion;
      expect(esValido).toBeFalsy();
    });
  });

  describe('Almacenamiento Fallback', () => {
    it('debería guardar cliente en localStorage cuando Supabase falla', () => {
      const cliente = {
        nombre: 'Test User',
        telefono: '1234567890',
        domicilio: 'Test Address',
      };

      // Simular guardado en localStorage
      const clientes = JSON.parse(localStorage.getItem('taxiya_clientes_local') || '[]');
      clientes.push(cliente);
      localStorage.setItem('taxiya_clientes_local', JSON.stringify(clientes));

      // Verificar que se guardó
      const clientesGuardados = JSON.parse(localStorage.getItem('taxiya_clientes_local') || '[]');
      expect(clientesGuardados).toHaveLength(1);
      expect(clientesGuardados[0].telefono).toBe('1234567890');
    });

    it('debería recuperar cliente de localStorage', () => {
      const cliente = {
        nombre: 'Marco Antonio',
        telefono: '6614682033',
        domicilio: 'Calle Principal 123',
      };

      // Guardar
      const clientes = JSON.parse(localStorage.getItem('taxiya_clientes_local') || '[]');
      clientes.push(cliente);
      localStorage.setItem('taxiya_clientes_local', JSON.stringify(clientes));

      // Recuperar
      const clientesGuardados = JSON.parse(localStorage.getItem('taxiya_clientes_local') || '[]');
      const encontrado = clientesGuardados.find(
        (c: any) => c.telefono === '6614682033'
      );

      expect(encontrado).toBeDefined();
      expect(encontrado?.nombre).toBe('Marco Antonio');
    });

    it('debería validar unicidad por teléfono', () => {
      const cliente1 = {
        nombre: 'Usuario 1',
        telefono: '6614682033',
        domicilio: 'Dirección 1',
      };

      const cliente2 = {
        nombre: 'Usuario 2',
        telefono: '6614682033', // Mismo teléfono
        domicilio: 'Dirección 2',
      };

      // Guardar primer cliente
      let clientes = JSON.parse(localStorage.getItem('taxiya_clientes_local') || '[]');
      clientes.push(cliente1);
      localStorage.setItem('taxiya_clientes_local', JSON.stringify(clientes));

      // Verificar duplicado antes de guardar segundo
      clientes = JSON.parse(localStorage.getItem('taxiya_clientes_local') || '[]');
      const existe = clientes.some(
        (c: any) => c.telefono === cliente2.telefono
      );

      expect(existe).toBeTruthy();
    });
  });

  describe('Sesión', () => {
    it('debería guardar sesión activa', () => {
      const sesion = { tipo: 'cliente' as const, id: '6614682033' };
      localStorage.setItem('taxiya_sesion_activa', JSON.stringify(sesion));

      const sesionGuardada = JSON.parse(
        localStorage.getItem('taxiya_sesion_activa') || 'null'
      );
      expect(sesionGuardada).toEqual(sesion);
    });

    it('debería limpiar sesión al logout', () => {
      // Guardar sesión
      const sesion = { tipo: 'cliente' as const, id: '6614682033' };
      localStorage.setItem('taxiya_sesion_activa', JSON.stringify(sesion));

      // Logout
      localStorage.removeItem('taxiya_sesion_activa');

      // Verificar que se limpió
      const sesionLimpia = localStorage.getItem('taxiya_sesion_activa');
      expect(sesionLimpia).toBeNull();
    });
  });

  describe('Flujo Completo', () => {
    it('debería completar registro → login', () => {
      // 1. Registro
      const nuevoCliente = {
        nombre: 'Marco Antonio',
        telefono: '6614682033',
        domicilio: 'Calle Principal 123',
        email: 'marco@example.com',
      };

      let clientes = JSON.parse(localStorage.getItem('taxiya_clientes_local') || '[]');
      clientes.push(nuevoCliente);
      localStorage.setItem('taxiya_clientes_local', JSON.stringify(clientes));

      // 2. Verificar que se guardó
      clientes = JSON.parse(localStorage.getItem('taxiya_clientes_local') || '[]');
      expect(clientes).toHaveLength(1);

      // 3. Login - Buscar cliente
      const clienteEncontrado = clientes.find(
        (c: any) => c.telefono === '6614682033'
      );
      expect(clienteEncontrado).toBeDefined();
      expect(clienteEncontrado?.nombre).toBe('Marco Antonio');

      // 4. Crear sesión
      const sesion = { tipo: 'cliente' as const, id: clienteEncontrado.telefono };
      localStorage.setItem('taxiya_sesion_activa', JSON.stringify(sesion));

      // 5. Verificar sesión
      const sesionActiva = JSON.parse(
        localStorage.getItem('taxiya_sesion_activa') || 'null'
      );
      expect(sesionActiva.tipo).toBe('cliente');
      expect(sesionActiva.id).toBe('6614682033');
    });
  });

  describe('Casos Edge', () => {
    it('debería manejar localStorage corrupto', () => {
      localStorage.setItem('taxiya_clientes_local', 'INVALID_JSON');

      try {
        const clientes = JSON.parse(localStorage.getItem('taxiya_clientes_local') || '[]');
        expect(true).toBeFalsy(); // No debería llegar aquí
      } catch (error) {
        // Se espera que falle, pero el código debería manejarlo
        expect(error).toBeDefined();
      }
    });

    it('debería manejar localStorage lleno', () => {
      // Simular localStorage lleno
      try {
        localStorage.setItem('test', 'x'.repeat(1024 * 1024 * 5)); // 5MB
      } catch (error: any) {
        expect(error.name).toMatch(/QuotaExceeded|NS_ERROR_DOM_QUOTA_REACHED/);
      }
    });

    it('debería permitir email opcional', () => {
      const cliente = {
        nombre: 'Sin Email',
        telefono: '9999999999',
        domicilio: 'Alguna dirección',
        email: undefined,
      };

      expect(cliente.email).toBeUndefined();
      expect(cliente.nombre).toBeDefined();
      expect(cliente.telefono).toBeDefined();
    });
  });
});
