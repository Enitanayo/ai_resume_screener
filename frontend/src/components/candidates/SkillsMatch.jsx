import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { parseRequirements } from '../../utils/helpers';

const SkillsMatch = ({ matchedSkills = [], requiredSkills = '' }) => {
    const required = typeof requiredSkills === 'string'
        ? parseRequirements(requiredSkills)
        : requiredSkills || [];

    const matched = matchedSkills.map((s) => s.toLowerCase());
    const missing = required.filter((skill) => !matched.includes(skill.toLowerCase()));

    return (
        <Card className="p-6">
            <h3 className="text-lg font-heading font-semibold text-dark-50 mb-4">
                Skills Analysis
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Matched */}
                <div>
                    <h4 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Matched Skills ({matchedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {matchedSkills.length > 0 ? (
                            matchedSkills.map((skill) => (
                                <Badge key={skill} variant="success">
                                    {skill}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-dark-400">No matched skills</p>
                        )}
                    </div>
                </div>

                {/* Missing */}
                <div>
                    <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        Missing Skills ({missing.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {missing.length > 0 ? (
                            missing.map((skill) => (
                                <Badge key={skill} variant="danger">
                                    {skill}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-dark-400">All skills matched!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Match Rate */}
            {required.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-400">Skill Match Rate</span>
                        <span className="font-bold text-dark-50">
                            {Math.round((matchedSkills.length / required.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.04] rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${(matchedSkills.length / required.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
};

export default SkillsMatch;
