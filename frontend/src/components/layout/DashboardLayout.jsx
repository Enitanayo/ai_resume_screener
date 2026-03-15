import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-[calc(100vh-80px)] bg-dark-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
