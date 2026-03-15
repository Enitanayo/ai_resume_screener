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
            <label className="block text-sm font-medium text-dark-300">
                Upload Resume
            </label>

            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group',
                        isDragActive
                            ? 'border-primary-500 bg-primary-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                            : 'border-white/[0.08] hover:border-primary-500/50 hover:bg-white/[0.02]',
                        displayError && 'border-red-500/50 bg-red-500/5'
                    )}
                >
                    <input {...getInputProps()} />

                    {/* Background glow on active/hover */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-transparent opacity-0 transition-opacity duration-500 rounded-2xl",
                        isDragActive ? "opacity-100" : "group-hover:opacity-100"
                    )} />

                    <motion.div
                        animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
                        className="relative z-10 space-y-4"
                    >
                        <div className="flex justify-center">
                            <div className={cn(
                                'p-4 rounded-2xl transition-colors duration-300',
                                isDragActive
                                    ? 'bg-primary-500/20 text-primary-400'
                                    : 'bg-white/[0.03] text-dark-500 group-hover:bg-primary-500/10 group-hover:text-primary-400'
                            )}>
                                <Upload className="w-8 h-8" />
                            </div>
                        </div>
                        <div>
                            <p className="text-base font-bold text-dark-50">
                                {isDragActive ? 'Drop your resume here' : 'Click or drag to upload'}
                            </p>
                            <p className="text-sm text-dark-400 mt-2">
                                Support for PDF and DOCX files
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-bold text-dark-500 uppercase tracking-widest">PDF</span>
                                <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-bold text-dark-500 uppercase tracking-widest">DOCX</span>
                                <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-bold text-dark-500 uppercase tracking-widest text-primary-400/70">MAX 10MB</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl relative group"
                    >
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <FileText className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-dark-50 truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs font-mono text-emerald-400/60 mt-0.5">
                                {fileService.formatFileSize(selectedFile.size)} • Ready to submit
                            </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />

                        <button
                            onClick={removeFile}
                            className="p-2 mr-1 rounded-xl bg-white/[0.03] hover:bg-red-500/10 text-dark-500 hover:text-red-400 transition-all"
                            title="Remove file"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                </AnimatePresence>
            )}

            {displayError && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-500 mt-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                    <AlertCircle className="w-4 h-4" /> {displayError}
                </p>
            )}
        </div>
    );
};

export default ResumeUpload;
