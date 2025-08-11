import React, { lazy, Suspense } from 'react';
const CategoryManager = lazy(() => import('./CategoryManager'));

const SettingsPage = () => {
  return (
    <div>
      <h2>Settings</h2>
      <Suspense fallback={<div className="card mt-4 p-3 text-center">Loading Category Manager...</div>}>
        <CategoryManager />
      </Suspense>
      {/* Other settings can be added here in the future */}
    </div>
  );
};

export default SettingsPage;