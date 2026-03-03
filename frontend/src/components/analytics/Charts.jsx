import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import Card from '../common/Card';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ScoreDistributionChart = ({ candidates = [] }) => {
    const distribution = [
        { range: '90-100%', count: 0, fill: '#10b981' },
        { range: '70-89%', count: 0, fill: '#6366f1' },
        { range: '50-69%', count: 0, fill: '#f59e0b' },
        { range: '30-49%', count: 0, fill: '#f97316' },
        { range: '0-29%', count: 0, fill: '#ef4444' },
    ];

    candidates.forEach((c) => {
        const score = (c.score_breakdown?.total_score || 0) * 100;
        if (score >= 90) distribution[0].count++;
        else if (score >= 70) distribution[1].count++;
        else if (score >= 50) distribution[2].count++;
        else if (score >= 30) distribution[3].count++;
        else distribution[4].count++;
    });

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Score Distribution
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#f8fafc',
                            }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {distribution.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export const SkillsChart = ({ candidates = [] }) => {
    const skillCount = {};
    candidates.forEach((c) => {
        (c.score_breakdown?.matched_skills || []).forEach((skill) => {
            skillCount[skill] = (skillCount[skill] || 0) + 1;
        });
    });

    const data = Object.entries(skillCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    if (data.length === 0) return null;

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Skills Among Candidates
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#f8fafc',
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const Charts = ({ candidates = [] }) => {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <ScoreDistributionChart candidates={candidates} />
            <SkillsChart candidates={candidates} />
        </div>
    );
};

export default Charts;
