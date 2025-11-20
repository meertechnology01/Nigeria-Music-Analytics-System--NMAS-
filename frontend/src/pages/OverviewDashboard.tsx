import { useEffect, useState } from 'react';
import { getKpis, getPlatformShare, getTrends } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { useSettings } from '../contexts/SettingsContext';
import { TrendingUp, Users, DollarSign, Play, MapPin } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface DashboardStats {
  totalStreams: number;
  totalRevenue: number;
  totalArtists: number;
  totalTracks: number;
}

interface PlatformData {
  platform: string;
  total_plays: number;
  total_revenue: number;
}

interface RegionalData {
  region: string;
  total_streams: number;
  unique_artists: number;
}

interface TimeSeriesData {
  date: string;
  streams: number;
  revenue: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function OverviewDashboard() {
  const { getCurrencySymbol, formatCurrency, convertCurrency, settings } = useSettings();
  const [stats, setStats] = useState<DashboardStats>({
    totalStreams: 0,
    totalRevenue: 0,
    totalArtists: 0,
    totalTracks: 0,
  });
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [kpi, trends, share] = await Promise.all([
        getKpis(),
        getTrends(),
        getPlatformShare(),
      ]);

      // Map fake/placeholder values into this UI shape
      setStats({
        totalStreams: Math.round((trends.data?.[trends.data.length - 1] || 0) / 3),
        totalRevenue: Number(String(kpi.export_revenue).replace(/[^\d.]/g, '')) * 1000000 || 0,
        totalArtists: 0,
        totalTracks: 0,
      });

      setPlatformData(
        (share.labels || []).map((label, idx) => ({
          platform: label,
          total_plays: share.data?.[idx] || 0,
          total_revenue: (share.data?.[idx] || 0) * 1000,
        }))
      );

      setTimeSeriesData(
        (trends.labels || []).map((label, idx) => ({
          date: label,
          streams: trends.data?.[idx] || 0,
          revenue: (trends.data?.[idx] || 0) * 0.003,
        }))
      );

      // Mock regional data based on Nigerian regions
      const totalStreams = trends.data?.reduce((sum, val) => sum + val, 0) || 0;
      setRegionalData([
        { region: 'Lagos', total_streams: Math.round(totalStreams * 0.35), unique_artists: 450 },
        { region: 'Abuja', total_streams: Math.round(totalStreams * 0.20), unique_artists: 280 },
        { region: 'Port Harcourt', total_streams: Math.round(totalStreams * 0.15), unique_artists: 190 },
        { region: 'Ibadan', total_streams: Math.round(totalStreams * 0.12), unique_artists: 150 },
        { region: 'Kano', total_streams: Math.round(totalStreams * 0.10), unique_artists: 120 },
        { region: 'Other Regions', total_streams: Math.round(totalStreams * 0.08), unique_artists: 95 },
      ]);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorAlert message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-600 mt-1">Last 30 days performance metrics</p>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Streams"
          value={stats.totalStreams.toLocaleString()}
          change="+12.5% from last month"
          changeType="positive"
          icon={Play}
        />
        <StatCard
          title="Total Revenue"
          value={`${getCurrencySymbol()}${stats.totalRevenue.toLocaleString()}`}
          change="+8.3% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Active Artists"
          value={stats.totalArtists.toLocaleString()}
          icon={Users}
          iconColor="text-purple-600"
        />
        <StatCard
          title="Total Tracks"
          value={stats.totalTracks.toLocaleString()}
          icon={TrendingUp}
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Streaming Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
              <XAxis dataKey="date" stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${settings.theme === 'dark' ? '#334155' : '#e2e8f0'}`, borderRadius: '8px', color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
              />
              <Legend wrapperStyle={{ color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }} />
              <Line type="monotone" dataKey="streams" stroke="#10b981" strokeWidth={2} name="Streams" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue by Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
              <XAxis dataKey="platform" stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${settings.theme === 'dark' ? '#334155' : '#e2e8f0'}`, borderRadius: '8px', color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
              />
              <Legend wrapperStyle={{ color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }} />
              <Bar dataKey="total_revenue" fill="#10b981" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Platform Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total_plays"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${settings.theme === 'dark' ? '#334155' : '#e2e8f0'}`, borderRadius: '8px', color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            Regional Distribution
          </h3>
          <div className="space-y-3">
            {regionalData.slice(0, 5).map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{region.region || 'Unknown'}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{region.total_streams.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((Number(region.total_streams) / (regionalData[0]?.total_streams || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
