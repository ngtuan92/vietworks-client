import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const JobseekerLayout = () => {
  return (
    <div className="min-h-screen bg-background font-body-md flex flex-col">
      {/* Navbar dùng chung */}
      <Navbar />
      
      {/* Nội dung chính của các trang con */}
      <div className="flex-grow">
        <Outlet />
      </div>

      {/* Footer dùng chung */}
      <Footer />
    </div>
  );
};

export default JobseekerLayout;
