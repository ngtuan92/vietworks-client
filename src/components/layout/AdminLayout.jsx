import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/dashboard/AdminSidebar';
import AdminHeader from '../admin/dashboard/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen flex overflow-hidden font-sans">
      <AdminSidebar />

      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 bg-slate-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
