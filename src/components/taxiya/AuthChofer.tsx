import { useState, useRef } from "react";
import { registrarChofer, loginChofer, setSesion, type Chofer } from "@/lib/taxiya-store";
import { useToast } from "./Toast";

interface Props {
  onBack: () => void;
  onLogin: (c: Chofer) => void;
}

export default function AuthChofer({ onBack, onLogin }: Props) {
  const [tab, setTab] = useState<"login" | "registro">("login");
  const { show } = useToast();

  const [placasLogin, setPlacasLogin] = useState("");

  const [nombre, setNombre] = useState("");
  const [placas, setPlacas] = useState("");
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const img = new Image();
        img.onload = () => {
          // Comprimir imagen progresivamente
          let quality = 0.85;
          let size = 350;
          let compressed = "";
          
          while (quality > 0.3) {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = "#fff";
              ctx.fillRect(0, 0, size, size);
              ctx.drawImage(img, 0, 0, size, size);
              compressed = canvas.toDataURL("image/jpeg", quality);
            }
            
            // Si cabe ahora, usar esta compresión
            if (compressed.length < 800 * 1024) {
              setFotoPreview(compressed);
              const sizeMB = (compressed.length / 1024 / 1024).toFixed(2);
              show(`✅ Foto procesada (${sizeMB}MB)`);
              return;
            }
            
            // Si no cabe, reducir calidad
            quality -= 0.15;
            size = Math.max(200, size - 50);
          }
          
          show("⚠️ No se puede comprimir más la foto. Intenta con una imagen diferente.", "error");
        };
        
        img.onerror = () => {
          show("❌ No se pudo procesar la imagen", "error");
        };
        
        img.src = event.target?.result as string;
      } catch (error) {
        show("❌ Error al procesar la foto", "error");
        console.error(error);
      }
    };
    
    if (file.size > 10 * 1024 * 1024) {
      show("❌ Archivo demasiado grande (máx 10MB)", "error");
      return;
    }
    
    reader.readAsDataURL(file);
  };

  const handleLogin = () => {
    if (!placasLogin) { show("Ingresa las placas", "error"); return; }
    const c = loginChofer(placasLogin);
    if (!c) { show("Placas no encontradas. Regístrate primero.", "error"); return; }
    setSesion({ tipo: "chofer", id: c.placas });
    show(`¡Bienvenido, ${c.nombre}!`);
    onLogin(c);
  };

  const handleRegistro = () => {
    if (!nombre || !placas || !modelo || !marca || !fotoPreview) {
      show("Completa todos los campos y sube tu foto", "error");
      return;
    }
    
    // Validar que fotoPreview no sea demasiado grande
    if (fotoPreview.length > 1024 * 1024) {
      show("Comprimiendo foto nuevamente...", "error");
      return;
    }

    try {
      const ok = registrarChofer({ 
        nombre, 
        placas: placas.toUpperCase(), 
        modelo, 
        marca, 
        foto: fotoPreview 
      });
      
      if (!ok) { 
        show("❌ Esas placas ya están registradas", "error"); 
        return; 
      }
      
      show("✅ ¡Registro exitoso!");
      setTab("login");
      setPlacasLogin(placas.toUpperCase());
      // Limpiar formulario
      setNombre("");
      setPlacas("");
      setModelo("");
      setMarca("");
      setFotoPreview("");
    } catch (error) {
      console.error("Error al registrar:", error);
      show("❌ Error al procesar el registro. Intenta de nuevo.", "error");
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-card font-body text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-colors";

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground mb-4 font-body text-sm">← Volver</button>
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-6">
            <span className="text-4xl">🚗</span>
            <h2 className="text-2xl font-heading font-bold text-foreground mt-2">Área de Chofer</h2>
          </div>

          <div className="flex rounded-xl bg-muted p-1 mb-6">
            {(["login", "registro"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg font-heading font-semibold text-sm transition-all ${tab === t ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"}`}>
                {t === "login" ? "Iniciar Sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Número de placas</label>
                <input value={placasLogin} onChange={(e) => setPlacasLogin(e.target.value.toUpperCase())} placeholder="Ej: ABC-123" className={inputClass} />
              </div>
              <button onClick={handleLogin} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg">
                Ingresar como Chofer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Nombre completo *</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Placas del vehículo *</label>
                <input value={placas} onChange={(e) => setPlacas(e.target.value.toUpperCase())} placeholder="ABC-123" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Marca *</label>
                  <input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Nissan" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Modelo *</label>
                  <input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Tsuru" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Fotografía *</label>
                <div className="flex items-center gap-4">
                  {fotoPreview && (
                    <img src={fotoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                  )}
                  <button onClick={() => fileRef.current?.click()} className="px-4 py-2 border border-border rounded-xl font-body text-sm hover:bg-muted transition-colors">
                    📷 Subir foto
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </div>
              </div>
              <button onClick={handleRegistro} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg">
                Registrarme como Chofer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
