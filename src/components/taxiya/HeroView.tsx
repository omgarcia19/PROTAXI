interface Props {
  onClienteClick: () => void;
  onChoferClick: () => void;
}

export default function HeroView({ onClienteClick, onChoferClick }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 bg-secondary hero-pattern overflow-hidden">
        <div className="animate-fade-in text-center z-10">
          <div className="text-6xl mb-4">🚕</div>
          <h1 className="text-5xl md:text-7xl font-heading font-black text-primary mb-2 tracking-tight">
            TaxiYa
          </h1>
          <p className="text-3xl md:text-4xl font-heading font-bold text-secondary-foreground mt-6 mb-3">
            ¿Cansado de buscar taxi?
          </p>
          <p className="text-lg md:text-xl text-secondary-foreground/70 mb-10 max-w-md mx-auto font-body">
            Realiza tu reservación aquí y nosotros vamos por ti 🚀
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onClienteClick}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-lg font-heading font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              🙋 Soy Cliente
            </button>
            <button
              onClick={onChoferClick}
              className="px-8 py-4 bg-card text-foreground border-2 border-primary rounded-xl text-lg font-heading font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              🚗 Soy Chofer
            </button>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-16 px-4 bg-background">
        <h2 className="text-3xl font-heading font-bold text-center mb-12 text-foreground">
          ¿Por qué elegirnos?
        </h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: "📍", title: "Tu ubicación exacta", desc: "Usamos GPS para ir directo a ti" },
            { icon: "⏰", title: "Elige tu hora", desc: "Reserva con anticipación" },
            { icon: "✅", title: "Chofer confirmado", desc: "Sabrás quién viene por ti" },
          ].map((item, i) => (
            <div
              key={i}
              className={`animate-fade-in delay-${(i + 1) * 100} bg-card rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-border text-center`}
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground font-body">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-secondary text-center text-secondary-foreground/60 font-body text-sm">
        TaxiYa © 2025 — Tu taxi, a tu puerta 🚕
      </footer>
    </div>
  );
}
