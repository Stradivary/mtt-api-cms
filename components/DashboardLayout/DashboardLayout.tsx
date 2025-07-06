import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Content from '../Content/Content';
import Footer from '../Footer/Footer';
import Breadcrumb from '../BreadCrumb/BreadCrumb';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`fixed md:static top-0 left-0 h-screen bg-gray-900 transition-all duration-300 z-40`}
      >
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 ml-0">
        <Header />
        <Breadcrumb />
        <div className="flex-1 overflow-y-auto p-4">
          <Content>
            {children}
          </Content>
        </div>
        <Footer />
      </div>
    </div>
  );
}
