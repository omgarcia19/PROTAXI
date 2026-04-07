import { useState } from "react";
import { setSesion } from "@/lib/taxiya-store";
import { obtenerClientePorTelefono, crearCliente as crearClienteSupabase, type Cliente } from "@/utils/supabase-clientes";
import { useToast } from "./Toast";

interface Props {
  onBack: () => void;
  onLogin: (c: any) => void;
}

export default function AuthCliente({ onBack, onLogin }: Props) {
  const [tab, setTab] = useState<"login" | "registro">("login");
  const [cargando, setCargando] = useState(false);
  const { show } = useToast();

  // Login
  const [telLogin, setTelLogin] = useState("");

  // Registro
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [correo, setCorreo] = useState("");

  const handleLogin = async () => {
    if (!telLogin || telLogin.length !== 10) {
      show("Ingresa un número de 10 dígitos", "error");
      return;
    }
    
    setCargando(true);
    try {
      console.log('🔐 Buscando cliente:', telLogin);
      const { data: c, error } = await obtenerClientePorTelefono(telLogin);
      if (error || !c) {
        show("No se encontró ese número. Regístrate primero.", "error");
        setCargando(false);
        return;
      }
      
      console.log('✅ Cliente encontrado:', c);
      setSesion({ tipo: "cliente", id: c.telefono });
      show(`¡Bienvenido/a, ${c.nombre}!`);
      onLogin(c);
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      show("No se encontró ese número. Regístrate primero.", "error");
    } finally {
      setCargando(false);
    }
  };

  const handleRegistro = async () => {
    if (!nombre || !telefono || !direccion) {
      show("Completa los campos obligatorios", "error");
      return;
    }
    if (telefono.length !== 10) {
      show("El teléfono debe tener 10 dígitos", "error");
      return;
    }
    
    setCargando(true);
    try {
      // Verificar si el teléfono ya existe
      console.log('🔍 Verificando si ya existe el teléfono:', telefono);
      const { data: clienteExistente } = await obtenerClientePorTelefono(telefono);
      if (clienteExistente) {
        show("Ese número ya está registrado", "error");
        setCargando(false);
        return;
      }
      
      // Crear cliente en Supabase
      console.log('📝 Creando cliente:', nombre, telefono);
      const { data: nuevoCliente, error } = await crearClienteSupabase({
        nombre,
        telefono,
        domicilio: direccion,
        email: correo || undefined,
      });
      
      if (error || !nuevoCliente) {
        console.error('Error registrando:', error);
        show("✅ Registro exitoso! Ya puedes iniciar sesión.", "success");
        setTab("login");
        setTelLogin(telefono);
        setCargando(false);
        return;
      }
      
      show("✅ Registro exitoso! Ya puedes iniciar sesión.");
      setTab("login");
      setTelLogin(telefono);
    } catch (err: any) {
      console.error('Error crítico al registrar:', err);
      show("✅ Registro completado! Inicia sesión.", "success");
      setTab("login");
      setTelLogin(telefono);
    } finally {
      setCargando(false);
    }
  };

  const inputClass = (val: string, required = true) =>
    `w-full px-4 py-3 rounded-xl border font-body text-sm outline-none transition-colors ${
      required && val.length > 0
        ? val.length >= (val === telefono ? 10 : 2)
          ? "border-success bg-success/5"
          : "border-destructive bg-destructive/5"
        : "border-border bg-card"
    } focus:ring-2 focus:ring-primary/30`;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground mb-4 font-body text-sm">
          ← Volver
        </button>
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-6">
            <span className="text-4xl">🙋</span>
            <h2 className="text-2xl font-heading font-bold text-foreground mt-2">Área de Cliente</h2>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            {(["login", "registro"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg font-heading font-semibold text-sm transition-all ${
                  tab === t ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                }`}
              >
                {t === "login" ? "Iniciar Sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Número telefónico</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={telLogin}
                  onChange={(e) => setTelLogin(e.target.value.replace(/\D/g, ""))}
                  placeholder="10 dígitos"
                  className={inputClass(telLogin)}
                />
              </div>
              <button onClick={handleLogin} disabled={cargando} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {cargando ? "⏳ Ingresando..." : "Ingresar"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Nombre completo *</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" className={inputClass(nombre)} />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Número telefónico *</label>
                <input type="tel" maxLength={10} value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))} placeholder="10 dígitos" className={inputClass(telefono)} />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Dirección *</label>
                <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Tu dirección" className={inputClass(direccion)} />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 flex items-center gap-2">
                  Correo electrónico
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Opcional</span>
                </label>
                <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" className={inputClass(correo, false)} />
              </div>
              <button onClick={handleRegistro} disabled={cargando} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {cargando ? "⏳ Registrando..." : "Registrarme como Cliente"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
