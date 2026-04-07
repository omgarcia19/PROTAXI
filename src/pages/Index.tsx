import { useState, useEffect } from "react";
import { getSesion, loginCliente, loginChofer, type Cliente, type Chofer } from "@/lib/taxiya-store";
import { supabase } from "@/utils/supabase";
import { ToastProvider } from "@/components/taxiya/Toast";
import HeroView from "@/components/taxiya/HeroView";
import AuthCliente from "@/components/taxiya/AuthCliente";
import AuthChofer from "@/components/taxiya/AuthChofer";
import DashboardCliente from "@/components/taxiya/DashboardCliente";
import DashboardChofer from "@/components/taxiya/DashboardChofer";

type Vista = "hero" | "auth-cliente" | "auth-chofer" | "dash-cliente" | "dash-chofer";

export default function Index() {
  const [vista, setVista] = useState<Vista>("hero");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [chofer, setChofer] = useState<Chofer | null>(null);
  const [todos, setTodos] = useState([]);

  // Detectar sesión activa al cargar y cargar datos de Supabase
  useEffect(() => {
    // Cargar sesión
    const sesion = getSesion();
    if (!sesion) return;
    if (sesion.tipo === "cliente") {
      const c = loginCliente(sesion.id);
      if (c) { setCliente(c); setVista("dash-cliente"); }
    } else {
      const ch = loginChofer(sesion.id);
      if (ch) { setChofer(ch); setVista("dash-chofer"); }
    }

    // Cargar datos de Supabase
    async function getTodos() {
      const { data: todos } = await supabase.from('todos').select()

      if (todos) {
        setTodos(todos)
      }
    }

    getTodos()
  }, []);

  const handleLogout = () => {
    setCliente(null);
    setChofer(null);
    setVista("hero");
  };

  return (
    <ToastProvider>
      <div className="min-h-screen">
        {vista === "hero" && (
          <HeroView onClienteClick={() => setVista("auth-cliente")} onChoferClick={() => setVista("auth-chofer")} />
        )}
        {vista === "auth-cliente" && (
          <AuthCliente onBack={() => setVista("hero")} onLogin={(c) => { setCliente(c); setVista("dash-cliente"); }} />
        )}
        {vista === "auth-chofer" && (
          <AuthChofer onBack={() => setVista("hero")} onLogin={(ch) => { setChofer(ch); setVista("dash-chofer"); }} />
        )}
        {vista === "dash-cliente" && cliente && (
          <DashboardCliente cliente={cliente} onLogout={handleLogout} />
        )}
        {vista === "dash-chofer" && chofer && (
          <DashboardChofer chofer={chofer} onLogout={handleLogout} />
        )}
        {/* Supabase Todos List */}
        {todos && todos.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-bold mb-2">Tareas desde Supabase:</h3>
            <ul className="space-y-1">
              {todos.map((todo: any) => (
                <li key={todo.id} className="text-sm">{todo.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
