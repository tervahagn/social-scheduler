import React, { useEffect, useState } from 'react';
import { getAnalyticsDashboard } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, Users, FileText, CheckCircle, Send } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
            </div>
        </div>
    </div>
);

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const dashboardData = await getAnalyticsDashboard();
            setData(dashboardData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    const { funnel, platforms, topPosts } = data;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-500">Overview of your content performance</p>
            </div>

            {/* Funnel Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Briefs"
                    value={funnel.briefs}
                    icon={FileText}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Generated Posts"
                    value={funnel.generated}
                    icon={Activity}
                    color="bg-purple-500"
                />
                <MetricCard
                    title="Approved"
                    value={funnel.approved}
                    icon={CheckCircle}
                    color="bg-green-500"
                    subtext={`${((funnel.approved / funnel.generated) * 100).toFixed(1)}% approval rate`}
                />
                <MetricCard
                    title="Published"
                    value={funnel.published}
                    icon={Send}
                    color="bg-indigo-500"
                    subtext={`${((funnel.published / funnel.approved) * 100).toFixed(1)}% success rate`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Platform Performance Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6">Platform Performance</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platforms}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="platform" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total_posts" name="Total Posts" fill="#8884d8" />
                                <Bar dataKey="published_count" name="Published" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performing Posts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6">Top Performing Posts</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topPosts.map((post) => (
                                    <tr key={post.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {post.platform}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex gap-2">
                                                <span title="Likes">👍 {post.likes}</span>
                                                <span title="Comments">💬 {post.comments}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {post.engagement_rate ? `${post.engagement_rate.toFixed(2)}%` : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {topPosts.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No engagement data yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
