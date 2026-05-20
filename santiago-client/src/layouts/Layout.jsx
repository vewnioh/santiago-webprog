import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Layout = () => (
  <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-neutral-950 text-white">
    <NavBar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
