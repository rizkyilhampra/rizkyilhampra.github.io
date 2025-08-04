export const SocialLink = ({ href, icon: Icon, label, description }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-6 bg-card border border-border rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-glow hover:bg-secondary/50"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-sm opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
          <div className="relative bg-gradient-primary rounded-lg p-3">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
            {label}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg 
            className="w-5 h-5 text-primary" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </a>
  );
};