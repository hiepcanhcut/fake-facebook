'use client';

export default function SimpleBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-background dark:bg-background-dark">
      {/* Gradient overlay với hình ảnh pattern */}
      <div className="absolute inset-0">
        {/* Light mode - subtle pattern */}
        <div 
          className="absolute inset-0 opacity-20 dark:hidden"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(24, 119, 242, 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Dark mode - subtle darker pattern */}
        <div 
          className="absolute inset-0 opacity-10 hidden dark:block"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(24, 119, 242, 0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/5 to-transparent dark:from-accent/10" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-400/5 to-transparent dark:from-purple-400/10" />
      </div>
    </div>
  );
}

