import { useState } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import Input from '../common/Input';
import Dropdown from '../common/Dropdown';

const JobFilters = ({ onSearch, onFilterChange, onSortChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch?.(value);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
                <Input
                    icon={Search}
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            <Dropdown
                placeholder="Status"
                options={[
                    { value: 'all', label: 'All Jobs' },
                    { value: 'active', label: 'Active Only' },
                    { value: 'inactive', label: 'Inactive Only' },
                ]}
                onSelect={(value) => onFilterChange?.(value)}
                className="w-full sm:w-40"
            />

            <Dropdown
                placeholder="Sort by"
                options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'title', label: 'By Title' },
                ]}
                onSelect={(value) => onSortChange?.(value)}
                className="w-full sm:w-40"
            />
        </div>
    );
};

export default JobFilters;
