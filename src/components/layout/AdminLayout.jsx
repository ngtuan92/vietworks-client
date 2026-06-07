import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/dashboard/AdminSidebar';
import AdminHeader from '../admin/dashboard/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="admin-dashboard-shell bg-slate-50 text-slate-900 min-h-screen flex overflow-hidden font-sans relative">
      {/* Ambient background blur */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10"></div>
      
      <AdminSidebar />

      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden z-10">
        <AdminHeader />

        <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
