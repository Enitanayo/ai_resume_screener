import Card from '../common/Card';
import { FileText } from 'lucide-react';

const ResumeViewer = ({ extractedText, email }) => {
    if (!extractedText) {
        return (
            <Card className="p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No resume text available</p>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-500" />
                    Resume Content
                </h3>
                {email && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">{email}</span>
                )}
            </div>

            <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-6 max-h-[500px] overflow-y-auto
        border border-gray-200 dark:border-dark-700">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {extractedText}
                </pre>
            </div>
        </Card>
    );
};

export default ResumeViewer;
