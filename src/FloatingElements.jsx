export const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Large floating orbs with varied movement */}
      <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-primary rounded-full blur-3xl opacity-30 animate-float-slow" />
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-accent rounded-full blur-2xl opacity-25 animate-float-medium" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-float-slow" style={{ animationDelay: '6s' }} />
      <div className="absolute bottom-1/4 right-1/3 w-36 h-36 bg-accent rounded-full blur-2xl opacity-30 animate-float-medium" style={{ animationDelay: '2s' }} />
      
      {/* Medium floating elements */}
      <div className="absolute top-20 left-1/2 w-24 h-24 bg-primary rounded-full blur-xl opacity-40 animate-float-fast" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-20 w-28 h-28 bg-accent rounded-full blur-xl opacity-35 animate-float-medium" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-32 left-20 w-20 h-20 bg-primary rounded-full blur-lg opacity-45 animate-float-fast" style={{ animationDelay: '5s' }} />
      
      {/* Small floating particles */}
      <div className="absolute top-1/6 left-3/4 w-12 h-12 bg-primary rounded-full blur-md opacity-50 animate-drift-diagonal" />
      <div className="absolute top-3/4 left-1/6 w-16 h-16 bg-accent rounded-full blur-md opacity-40 animate-drift-reverse" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/12 w-14 h-14 bg-primary rounded-full blur-md opacity-45 animate-drift-circular" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/6 right-1/6 w-10 h-10 bg-accent rounded-full blur-sm opacity-55 animate-drift-diagonal" style={{ animationDelay: '4s' }} />
      
      {/* Geometric shapes */}
      <div className="absolute top-1/3 left-1/12 w-6 h-6 bg-primary opacity-60 rotate-45 animate-spin-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/3 right-1/12 w-4 h-4 bg-accent opacity-50 animate-pulse-glow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-2/3 right-3/4 w-8 h-8 bg-primary opacity-40 rounded-full animate-bounce-subtle" style={{ animationDelay: '2s' }} />
      
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.05),transparent_50%)] animate-glow-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(245,169,127,0.05),transparent_50%)] animate-glow-slow" style={{ animationDelay: '5s' }} />
    </div>
  );
};
