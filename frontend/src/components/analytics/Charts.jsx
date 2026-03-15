import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import Card from '../common/Card';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#14b8a6', '#8b5cf6', '#a855f7'];

export const ScoreDistributionChart = ({ candidates = [] }) => {
    const distribution = [
        { range: '90-100%', count: 0, fill: '#10b981' },
        { range: '70-89%', count: 0, fill: '#6366f1' },
        { range: '50-69%', count: 0, fill: '#f59e0b' },
        { range: '30-49%', count: 0, fill: '#f97316' },
        { range: '0-29%', count: 0, fill: '#ef4444' },
    ];

    candidates.forEach((c) => {
        const score = (c.total_weighted_score || 0) * 100;
        if (score >= 90) distribution[0].count++;
        else if (score >= 70) distribution[1].count++;
        else if (score >= 50) distribution[2].count++;
        else if (score >= 30) distribution[3].count++;
        else distribution[4].count++;
    });

    return (
        <Card className="p-6">
            <h3 className="text-lg font-heading font-semibold text-dark-50 mb-4">
                Score Distribution
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                            dataKey="range"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#151821',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#F5F7FA',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                            }}
                            itemStyle={{ color: '#F5F7FA' }}
                            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {distribution.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} fillOpacity={0.8} />
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
        (c.parsed_skills || []).forEach((skill) => {
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
            <h3 className="text-lg font-heading font-semibold text-dark-50 mb-4">
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
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#151821',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#F5F7FA',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px', color: '#A1A8B3' }}
                        />
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
