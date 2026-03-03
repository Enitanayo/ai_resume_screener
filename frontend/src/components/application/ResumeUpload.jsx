import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import fileService from '../../services/fileService';
import cn from '../../utils/cn';

const ResumeUpload = ({ onFileSelect, selectedFile, error: externalError }) => {
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const validation = fileService.validateResumeFile(file);
        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        setError(null);
        onFileSelect?.(file);
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
        maxSize: fileService.MAX_FILE_SIZE,
    });

    const removeFile = () => {
        onFileSelect?.(null);
        setError(null);
    };

    const displayError = externalError || error;

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload Resume
            </label>

            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                        isDragActive
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                            : 'border-gray-300 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/5',
                        displayError && 'border-red-500'
                    )}
                >
                    <input {...getInputProps()} />
                    <motion.div
                        animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                        className="space-y-3"
                    >
                        <div className="flex justify-center">
                            <div className={cn(
                                'p-3 rounded-full',
                                isDragActive
                                    ? 'bg-primary-100 dark:bg-primary-900/30'
                                    : 'bg-gray-100 dark:bg-dark-700'
                            )}>
                                <Upload className={cn(
                                    'w-8 h-8',
                                    isDragActive
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-gray-400'
                                )} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                or click to browse • PDF, DOCX • Max 10MB
                            </p>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl"
                    >
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {fileService.formatFileSize(selectedFile.size)}
                            </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <button
                            onClick={removeFile}
                            className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                    </motion.div>
                </AnimatePresence>
            )}

            {displayError && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" /> {displayError}
                </p>
            )}
        </div>
    );
};

export default ResumeUpload;
