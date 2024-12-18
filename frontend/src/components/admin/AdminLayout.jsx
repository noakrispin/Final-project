import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminNavbar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

