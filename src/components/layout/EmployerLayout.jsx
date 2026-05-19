import { Outlet } from 'react-router-dom';
import EmployerSidebar from '../employer/dashboard/EmployerSidebar';
import EmployerHeader from '../employer/dashboard/EmployerHeader';

const EmployerLayout = () => {
  return (
    <div className="bg-[#fbf9f8] text-gray-900 min-h-screen flex overflow-hidden">
      {/* Sidebar cố định */}
      <EmployerSidebar />

      {/* Vùng nội dung chính */}
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header cố định */}
        <EmployerHeader />

        {/* Nơi nội dung của từng trang con sẽ hiển thị */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-4 py-6 lg:px-6">
          <div className="w-full max-w-none">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployerLayout;
