import React from 'react';

export const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-graphite-950">
      <header className="flex h-16 items-center justify-between border-b border-gray-150 dark:border-graphite-800 bg-white dark:bg-graphite-900 px-6">
        <span className="text-sm font-bold text-forest-500">VenueOS AI Portal</span>
      </header>
      <main>{children}</main>
    </div>
  );
};
export default LandingLayout;
