export const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Background glows - subtle entrance + continuous glow */}
      <div 
        className="absolute inset-0 animate-fade-in-float" 
        style={{ animationDelay: "0.1s", animationFillMode: 'both' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.05),transparent_50%)] animate-glow-slow" />
      </div>
      <div
        className="absolute inset-0 animate-fade-in-float"
        style={{ animationDelay: "0.3s", animationFillMode: 'both' }}
      >
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(245,169,127,0.05),transparent_50%)] animate-glow-slow" 
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Large floating orbs - only smooth seamless animations */}
      <div 
        className="absolute top-[10%] left-[5%] animate-scale-in-float" 
        style={{ animationDelay: "0.2s", animationFillMode: 'both' }}
      >
        <div 
          className="w-40 h-40 bg-gradient-primary rounded-full blur-3xl opacity-30 animate-float-slow" 
          style={{ animationDelay: "0.5s" }}
        />
      </div>
      <div
        className="absolute top-[15%] right-[8%] animate-fade-in-float"
        style={{ animationDelay: "0.4s", animationFillMode: 'both' }}
      >
        <div 
          className="w-32 h-32 bg-accent rounded-full blur-2xl opacity-25 animate-float-medium" 
          style={{ animationDelay: "1.2s" }}
        />
      </div>
      <div
        className="absolute bottom-[20%] left-[10%] animate-scale-in-float"
        style={{ animationDelay: "0.6s", animationFillMode: 'both' }}
      >
        <div 
          className="w-48 h-48 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-float-slow" 
          style={{ animationDelay: "2.1s" }}
        />
      </div>
      <div
        className="absolute bottom-[10%] right-[15%] animate-fade-in-float"
        style={{ animationDelay: "0.8s", animationFillMode: 'both' }}
      >
        <div 
          className="w-36 h-36 bg-accent rounded-full blur-2xl opacity-30 animate-float-medium" 
          style={{ animationDelay: "0.8s" }}
        />
      </div>

      {/* Medium elements - smooth floating only */}
      <div
        className="absolute top-[25%] left-[75%] animate-scale-in-float"
        style={{ animationDelay: "0.5s", animationFillMode: 'both' }}
      >
        <div 
          className="w-24 h-24 bg-primary rounded-full blur-xl opacity-40 animate-float-fast" 
          style={{ animationDelay: "1.8s" }}
        />
      </div>
      <div
        className="absolute top-[60%] right-[5%] animate-fade-in-float"
        style={{ animationDelay: "0.7s", animationFillMode: 'both' }}
      >
        <div 
          className="w-28 h-28 bg-accent rounded-full blur-xl opacity-35 animate-float-medium" 
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      <div
        className="absolute bottom-[40%] left-[5%] animate-scale-in-float"
        style={{ animationDelay: "0.9s", animationFillMode: 'both' }}
      >
        <div 
          className="w-20 h-20 bg-primary rounded-full blur-lg opacity-45 animate-float-fast" 
          style={{ animationDelay: "2.7s" }}
        />
      </div>

      {/* Small particles - gentle floating movements */}
      <div 
        className="absolute top-[35%] left-[85%] animate-fade-in-float" 
        style={{ animationDelay: "0.3s", animationFillMode: 'both' }}
      >
        <div 
          className="w-12 h-12 bg-primary rounded-full blur-md opacity-50 animate-float-fast" 
          style={{ animationDelay: "1.5s" }}
        />
      </div>
      <div
        className="absolute top-[70%] left-[20%] animate-scale-in-float"
        style={{ animationDelay: "0.6s", animationFillMode: 'both' }}
      >
        <div 
          className="w-16 h-16 bg-accent rounded-full blur-md opacity-40 animate-float-medium" 
          style={{ animationDelay: "2.3s" }}
        />
      </div>
      <div
        className="absolute top-[45%] left-[2%] animate-fade-in-float"
        style={{ animationDelay: "0.4s", animationFillMode: 'both' }}
      >
        <div 
          className="w-14 h-14 bg-primary rounded-full blur-md opacity-45 animate-float-slow" 
          style={{ animationDelay: "0.9s" }}
        />
      </div>
      <div
        className="absolute bottom-[25%] right-[25%] animate-scale-in-float"
        style={{ animationDelay: "0.8s", animationFillMode: 'both' }}
      >
        <div 
          className="w-10 h-10 bg-accent rounded-full blur-sm opacity-55 animate-float-fast" 
          style={{ animationDelay: "3.1s" }}
        />
      </div>
    </div>
  );
};
