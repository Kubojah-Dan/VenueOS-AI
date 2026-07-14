import React from 'react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-graphite-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-graphite-900 p-8 border border-gray-150 dark:border-graphite-800 rounded-xl shadow-premium">
        {children}
      </div>
    </div>
  );
};
export default AuthLayout;
