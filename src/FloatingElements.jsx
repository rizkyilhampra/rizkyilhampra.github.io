export const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Background glows - responsive scaling with organic movement */}
      <div 
        className="absolute inset-0 animate-fade-in-float motion-reduce:animate-none" 
        style={{ animationDelay: "0.1s", animationFillMode: 'both' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.05),transparent_50%)] animate-glow-slow motion-reduce:animate-none" />
      </div>
      <div
        className="absolute inset-0 animate-fade-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.3s", animationFillMode: 'both' }}
      >
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(245,169,127,0.05),transparent_50%)] animate-glow-slow motion-reduce:animate-none" 
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Large floating orbs - responsive sizing with organic rotation */}
      <div 
        className="absolute top-[10%] left-[5%] animate-scale-in-float motion-reduce:animate-none" 
        style={{ animationDelay: "0.2s", animationFillMode: 'both' }}
      >
        <div 
          className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-primary rounded-full blur-2xl sm:blur-3xl opacity-20 sm:opacity-30 animate-float-organic-1 motion-reduce:animate-none" 
          style={{ animationDelay: "0.5s" }}
        />
      </div>
      <div
        className="absolute top-[15%] right-[8%] animate-fade-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.4s", animationFillMode: 'both' }}
      >
        <div 
          className="w-24 h-24 sm:w-32 sm:h-32 bg-accent rounded-full blur-xl sm:blur-2xl opacity-20 sm:opacity-25 animate-float-organic-2 motion-reduce:animate-none" 
          style={{ animationDelay: "1.2s" }}
        />
      </div>
      <div
        className="absolute bottom-[20%] left-[10%] animate-scale-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.6s", animationFillMode: 'both' }}
      >
        <div 
          className="w-36 h-36 sm:w-48 sm:h-48 bg-gradient-primary rounded-full blur-2xl sm:blur-3xl opacity-15 sm:opacity-20 animate-float-organic-3 motion-reduce:animate-none" 
          style={{ animationDelay: "2.1s" }}
        />
      </div>
      <div
        className="absolute bottom-[10%] right-[15%] animate-fade-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.8s", animationFillMode: 'both' }}
      >
        <div 
          className="w-28 h-28 sm:w-36 sm:h-36 bg-accent rounded-full blur-xl sm:blur-2xl opacity-25 sm:opacity-30 animate-float-organic-1 motion-reduce:animate-none" 
          style={{ animationDelay: "0.8s" }}
        />
      </div>

      {/* Medium elements - responsive with subtle organic movement */}
      <div
        className="absolute top-[25%] left-[75%] animate-scale-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.5s", animationFillMode: 'both' }}
      >
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full blur-lg sm:blur-xl opacity-35 sm:opacity-40 animate-float-organic-2 motion-reduce:animate-none" 
          style={{ animationDelay: "1.8s" }}
        />
      </div>
      <div
        className="absolute top-[60%] right-[5%] animate-fade-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.7s", animationFillMode: 'both' }}
      >
        <div 
          className="w-20 h-20 sm:w-28 sm:h-28 bg-accent rounded-full blur-lg sm:blur-xl opacity-30 sm:opacity-35 animate-float-organic-3 motion-reduce:animate-none" 
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      <div
        className="absolute bottom-[40%] left-[5%] animate-scale-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.9s", animationFillMode: 'both' }}
      >
        <div 
          className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full blur-md sm:blur-lg opacity-40 sm:opacity-45 animate-float-organic-1 motion-reduce:animate-none" 
          style={{ animationDelay: "2.7s" }}
        />
      </div>

      {/* Small particles - mobile optimized with gentle organic movement */}
      <div 
        className="absolute top-[35%] left-[85%] animate-fade-in-float motion-reduce:animate-none" 
        style={{ animationDelay: "0.3s", animationFillMode: 'both' }}
      >
        <div 
          className="w-8 h-8 sm:w-12 sm:h-12 bg-primary rounded-full blur-sm sm:blur-md opacity-45 sm:opacity-50 animate-float-organic-2 motion-reduce:animate-none" 
          style={{ animationDelay: "1.5s" }}
        />
      </div>
      <div
        className="absolute top-[70%] left-[20%] animate-scale-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.6s", animationFillMode: 'both' }}
      >
        <div 
          className="w-10 h-10 sm:w-16 sm:h-16 bg-accent rounded-full blur-sm sm:blur-md opacity-35 sm:opacity-40 animate-float-organic-3 motion-reduce:animate-none" 
          style={{ animationDelay: "2.3s" }}
        />
      </div>
      <div
        className="absolute top-[45%] left-[2%] animate-fade-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.4s", animationFillMode: 'both' }}
      >
        <div 
          className="w-10 h-10 sm:w-14 sm:h-14 bg-primary rounded-full blur-sm sm:blur-md opacity-40 sm:opacity-45 animate-float-organic-1 motion-reduce:animate-none" 
          style={{ animationDelay: "0.9s" }}
        />
      </div>
      <div
        className="absolute bottom-[25%] right-[25%] animate-scale-in-float motion-reduce:animate-none"
        style={{ animationDelay: "0.8s", animationFillMode: 'both' }}
      >
        <div 
          className="w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-full blur-sm opacity-50 sm:opacity-55 animate-float-organic-2 motion-reduce:animate-none" 
          style={{ animationDelay: "3.1s" }}
        />
      </div>
    </div>
  );
};
