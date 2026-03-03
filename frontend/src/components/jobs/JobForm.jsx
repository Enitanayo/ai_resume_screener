import { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { Briefcase, FileText, List, Save, Tag, X } from 'lucide-react';
import { showToast } from '../../components/common/Toast';

const JobForm = ({ initialData = {}, onSubmit, isLoading = false, submitLabel = 'Create Job' }) => {
    const [formData, setFormData] = useState({
        job_title: initialData.job_title || '',
        job_description: initialData.job_description || '',
        required_skills: initialData.required_skills || [],
    });
    const [errors, setErrors] = useState({});
    const [skillInput, setSkillInput] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const addSkill = () => {
        const skill = skillInput.trim();
        if (skill && !formData.required_skills.includes(skill)) {
            setFormData((prev) => ({
                ...prev,
                required_skills: [...prev.required_skills, skill],
            }));
        }
        setSkillInput('');
    };

    const removeSkill = (skillToRemove) => {
        setFormData((prev) => ({
            ...prev,
            required_skills: prev.required_skills.filter((s) => s !== skillToRemove),
        }));
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
        if (!formData.job_description.trim()) newErrors.job_description = 'Description is required';
        if (formData.required_skills.length === 0) newErrors.required_skills = 'At least one skill is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // Send data in backend-expected format
            await onSubmit({
                job_title: formData.job_title.trim(),
                job_description: formData.job_description.trim(),
                required_skills: formData.required_skills,
            });
        } catch (err) {
            showToast.error(err.message || 'Failed to save job');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Job Title"
                        name="job_title"
                        icon={Briefcase}
                        placeholder="e.g. Python Engineer"
                        value={formData.job_title}
                        onChange={handleChange}
                        error={errors.job_title}
                    />

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            name="job_description"
                            rows={5}
                            placeholder="Include responsibilities, team info, culture, and what makes this role unique..."
                            value={formData.job_description}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-300 dark:border-dark-600
                bg-white dark:bg-dark-800 text-gray-900 dark:text-white
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500
                focus:border-transparent transition-all duration-200 resize-none"
                        />
                        {errors.job_description && (
                            <p className="text-sm text-red-500">{errors.job_description}</p>
                        )}
                    </div>

                    {/* Required Skills Tag Input */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Required Skills
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleSkillKeyDown}
                                    placeholder="Type a skill and press Enter..."
                                    className="block w-full rounded-lg border border-gray-300 dark:border-dark-600
                        bg-white dark:bg-dark-800 text-gray-900 dark:text-white
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500
                        focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <Button type="button" variant="secondary" size="md" onClick={addSkill} disabled={!skillInput.trim()}>
                                Add
                            </Button>
                        </div>
                        {errors.required_skills && (
                            <p className="text-sm text-red-500">{errors.required_skills}</p>
                        )}
                        {formData.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.required_skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                            bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            className="ml-0.5 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        icon={Save}
                        isLoading={isLoading}
                    >
                        {submitLabel}
                    </Button>
                </form>
            </Card>
        </motion.div>
    );
};

export default JobForm;
