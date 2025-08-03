import React from 'react';
import Navbar from '../../components/NavBar';
import Sidebar from '../../components/SideBar';
import Breadcrumb from '../../components/Breadcrumb';
import MobileNav from '../../components/MobileNav';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen min-w-full bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default Layout;
