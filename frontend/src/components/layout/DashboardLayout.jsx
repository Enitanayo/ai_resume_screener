import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-dark-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
