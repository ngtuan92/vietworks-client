
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import CVWelcome from '../../../components/jobseeker/cv/CVWelcome';
import CVFilter from '../../../components/jobseeker/cv/CVFilter';
import { CVCard, CVPlaceholderCard } from '../../../components/jobseeker/cv/CVCard';
import ProfileStrength from '../../../components/jobseeker/cv/ProfileStrength';
import CVExpertReview from '../../../components/jobseeker/cv/CVExpertReview';
import CareerResources from '../../../components/jobseeker/cv/CareerResources';

const ManageCV = () => {
  const cvs = [
    {
      id: 1,
      title: "Senior Project Manager",
      date: "2 days ago",
      isActive: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCZZrdFGhDg0yENKK7pbUffm_Tg02eahPoW9kuTSO6hzM2NQA9y9TY-YJjiYoeBWalBfrx_wzb1hxEEFV4x_0EHD3hQ3yKGUFa8z7IIvW1ESpYaXRN9w_fooBOI40MyDx8YquietMy1VXnmuKWe2OtThVXpb3eSEE-mpEqc6xczg5jEiKcHZ4ped_KbH8lGhXF8h2kIs7F4JhkPEBgatSdFj9IFaZomRRZaUdzSuXIl8rqnngnFhW2xfBapmlHmqFSHriRXzhW_01k"
    },
    {
      id: 2,
      title: "Business Analyst",
      date: "Jan 15, 2024",
      isActive: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuArEOyN7T1Xd-fuXEqelvU5ylKbqMFjSLm3eUGlOZZkjNbOkyU4wsZjCE_fC3UGiljeYHF40i38g6lfauzcRr9MIY2zxSnBTRE6pCEzawfpQ2xIVaxXvGzJQJ4ATeS_VvAT0ObbzvrMI7Xo6ZUTLHZ4iy0KSxU68iREVF7m3BB-g5QANBcLNWncr1c5UsE1owXiModNwHABEZiivPh82hvMuyDrR7TzLUrkq8Ig9SWP3iB7QoRicLzGpBDu3uoPFKc0UVpFx9WZar1T"
    }
  ];

  return (
    <div className="min-h-screen bg-background font-body-md">
      
      <main className="max-w-container-max mx-auto px-gutter py-stack-lg">
        {/* Welcome Section */}
        <CVWelcome />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* CV List - Main Content */}
          <div className="lg:col-span-8 space-y-stack-lg">
            {/* Filter and Stats */}
            <CVFilter />

            {/* CV Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
              {cvs.map(cv => (
                <CVCard key={cv.id} {...cv} />
              ))}
              
              {/* Create Placeholder */}
              <CVPlaceholderCard />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-stack-lg">
            <ProfileStrength />
            <CVExpertReview />
            <CareerResources />
          </div>
        </div>
      </main>

      {/* Floating Action for Help */}
      <div className="fixed bottom-gutter right-gutter flex flex-col gap-stack-md items-end z-40">
        <button className="bg-surface-container-lowest shadow-lg border border-outline-variant p-stack-md rounded-full text-on-surface-variant hover:text-primary transition-all group relative">
          <span className="material-symbols-outlined">help_center</span>
          <span className="absolute right-full mr-stack-md whitespace-nowrap bg-on-surface text-on-secondary px-3 py-1 rounded text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Support</span>
        </button>
        <button className="bg-primary text-on-secondary shadow-lg p-stack-md rounded-full hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined">chat</span>
        </button>
      </div>
    </div>
  );
};

export default ManageCV;
