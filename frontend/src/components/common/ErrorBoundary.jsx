import { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error Boundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                        An unexpected error occurred. Please try refreshing the page.
                    </p>
                    <Button
                        variant="primary"
                        icon={RefreshCcw}
                        onClick={this.handleReset}
                    >
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
