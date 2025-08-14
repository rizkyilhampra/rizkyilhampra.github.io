export const SocialLink = ({ href, icon: Icon, label, description }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block p-4 sm:p-6 bg-card border border-border rounded-lg transition-all duration-500 hover:scale-[1.03] hover:shadow-glow hover:bg-secondary/50 h-full min-h-[120px] sm:min-h-[140px] overflow-hidden transform-gpu outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none"
    >
      {/* Animated background element */}
      <div className="absolute inset-0 -z-10 motion-reduce:hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 transform -translate-x-1/2 translate-y-1/2 group-hover:scale-125" />
      </div>
      
      {/* External link indicator with enhanced animation */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0 motion-reduce:opacity-100 motion-reduce:transform-none motion-reduce:transition-none">
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5 text-primary" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-4 h-full">
        {/* Icon container with enhanced animations */}
        <div className="relative flex-shrink-0 transform transition-all duration-500 group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none">
          <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-all duration-700 transform scale-90 group-hover:scale-125 motion-reduce:transform-none motion-reduce:transition-none" />
          <div className="relative bg-gradient-primary rounded-lg p-2.5 sm:p-3 transform transition-all duration-500 group-hover:rotate-[10deg] motion-reduce:transform-none motion-reduce:transition-none">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground transform transition-transform duration-500 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
          </div>
        </div>
        
        {/* Text content with animation */}
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 break-words hyphens-auto transform transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none">
            {label}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 break-words hyphens-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300 transform transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-lg pointer-events-none">
        <div className="absolute inset-0 border border-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 motion-reduce:opacity-100 motion-reduce:transition-none" />
      </div>
      <span className="sr-only">Opens in new tab</span>
    </a>
  );
};
