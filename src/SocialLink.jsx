export const SocialLink = ({ href, icon: Icon, label, description }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block p-4 sm:p-6 bg-card border border-border rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-glow hover:bg-secondary/50 h-full min-h-[120px] sm:min-h-[140px]"
    >
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5 text-primary" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4 h-full">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-sm opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
          <div className="relative bg-gradient-primary rounded-lg p-2.5 sm:p-3">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 break-words hyphens-auto">
            {label}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 break-words hyphens-auto">
              {description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
};
