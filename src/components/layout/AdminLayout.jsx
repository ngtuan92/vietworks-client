import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/dashboard/AdminSidebar';
import AdminHeader from '../admin/dashboard/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="admin-dashboard-shell bg-slate-50 text-slate-900 min-h-screen flex overflow-hidden font-sans">
      <AdminSidebar />

      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden z-10">
        <AdminHeader />

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-4 py-6 lg:px-6 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
