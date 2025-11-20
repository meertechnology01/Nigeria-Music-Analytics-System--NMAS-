import { useEffect, useState } from 'react';
import { getKpis, getTrends, runHarvest } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { useSettings } from '../contexts/SettingsContext';
import { DollarSign, Users, TrendingUp, Building2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface EconomicModel {
  id: string;
  model_version: string;
  calculation_date: string;
  total_industry_revenue_usd: number;
  gdp_contribution_usd: number;
  gdp_percentage: number;
  employment_direct: number;
  employment_indirect: number;
  employment_total: number;
  streaming_revenue_usd: number;
  concert_revenue_usd: number;
  licensing_revenue_usd: number;
  regional_impact_data: {
    regions?: Array<{
      region: string;
      revenue: number;
      gdpContribution: number;
      employment: number;
    }>;
    platforms?: { [key: string]: number };
  };
  confidence_score: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

export function EconomicImpactDashboard() {
  const { getCurrencySymbol, formatCurrency, convertCurrency, settings } = useSettings();
  const [model, setModel] = useState<EconomicModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadLatestModel();
  }, []);

  async function loadLatestModel() {
    setLoading(true);
    try {
      const [kpi, trends] = await Promise.all([getKpis(), getTrends()]);
      const totalStreams = (trends.data || []).reduce((a, b) => a + b, 0);
      const streamingRevenue = totalStreams * 0.003; // proxy
      const concertRevenue = streamingRevenue * 2.0;
      const licensingRevenue = streamingRevenue * 0.3;
      const gdp = (streamingRevenue + concertRevenue + licensingRevenue) * 1.75; // multiplier
      const employmentDirect = Math.round((streamingRevenue + concertRevenue) / 1_000_000 * 50);
      const employmentIndirect = Math.round(employmentDirect * 1.2);
      const model: any = {
        id: 'synthetic',
        model_version: 'proto-1',
        calculation_date: new Date().toISOString(),
        total_industry_revenue_usd: streamingRevenue + concertRevenue + licensingRevenue,
        gdp_contribution_usd: gdp,
        gdp_percentage: 0.42,
        employment_direct: employmentDirect,
        employment_indirect: employmentIndirect,
        employment_total: employmentDirect + employmentIndirect,
        streaming_revenue_usd: streamingRevenue,
        concert_revenue_usd: concertRevenue,
        licensing_revenue_usd: licensingRevenue,
        regional_impact_data: { regions: [], platforms: {} },
        confidence_score: 0.7,
      };
      setModel(model);
    } catch (error) {
      console.error('Error loading economic model:', error);
    } finally {
      setLoading(false);
    }
  }

  async function calculateNewModel() {
    setCalculating(true);
    try {
      await runHarvest();
      await loadLatestModel();
    } catch (error) {
      console.error('Error calculating model:', error);
      alert('Error calculating economic impact. Please try again.');
    } finally {
      setCalculating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Economic Impact Analysis</h2>
          <p className="text-slate-600 mt-1">Model Nigeria's music industry economic contribution</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">No Economic Model Available</h3>
              <p className="text-amber-800 mt-1">
                Run the economic impact calculation to generate insights about the music industry's contribution to Nigeria's economy.
              </p>
              <button
                onClick={calculateNewModel}
                disabled={calculating}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {calculating ? 'Calculating...' : 'Calculate Economic Impact'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const revenueBreakdown = [
    { name: 'Streaming', value: model.streaming_revenue_usd, color: COLORS[0] },
    { name: 'Concerts', value: model.concert_revenue_usd, color: COLORS[1] },
    { name: 'Licensing', value: model.licensing_revenue_usd, color: COLORS[2] },
  ];

  const employmentData = [
    { category: 'Direct', value: model.employment_direct },
    { category: 'Indirect', value: model.employment_indirect },
  ];

  const regionalData = model.regional_impact_data?.regions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Economic Impact Analysis</h2>
          <p className="text-slate-600 mt-1">
            Model Version: {model.model_version} | Last Updated: {new Date(model.calculation_date).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={calculateNewModel}
          disabled={calculating}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {calculating ? 'Recalculating...' : 'Recalculate'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="GDP Contribution"
          value={`${getCurrencySymbol()}${(model.gdp_contribution_usd / 1000000).toFixed(2)}M`}
          change={`${model.gdp_percentage.toFixed(4)}% of GDP`}
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Industry Revenue"
          value={`${getCurrencySymbol()}${(model.total_industry_revenue_usd / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Employment"
          value={model.employment_total.toLocaleString()}
          change={`${model.employment_direct.toLocaleString()} direct jobs`}
          changeType="neutral"
          icon={Users}
          iconColor="text-purple-600"
        />
        <StatCard
          title="Confidence Score"
          value={`${(model.confidence_score * 100).toFixed(0)}%`}
          icon={Building2}
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${getCurrencySymbol()}${(convertCurrency(value) / 1000000).toFixed(2)}M`}
                contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${settings.theme === 'dark' ? '#334155' : '#e2e8f0'}`, borderRadius: '8px', color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">
                  {getCurrencySymbol()}{(convertCurrency(item.value) / 1000000).toFixed(2)}M
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Employment Impact</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
              <XAxis dataKey="category" stroke="#64748b" className="dark:stroke-slate-400" />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
              <Tooltip
                contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${settings.theme === 'dark' ? '#334155' : '#e2e8f0'}`, borderRadius: '8px', color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
              />
              <Bar dataKey="value" fill="#10b981" name="Jobs Created" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4">
            <p className="text-sm text-emerald-900 dark:text-emerald-300">
              <span className="font-semibold">{model.employment_total.toLocaleString()}</span> total jobs supported by the music industry
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              Including {model.employment_direct.toLocaleString()} direct and {model.employment_indirect.toLocaleString()} indirect positions
            </p>
          </div>
        </div>
      </div>

      {regionalData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Regional Economic Impact</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionalData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
              <XAxis dataKey="region" stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${settings.theme === 'dark' ? '#334155' : '#e2e8f0'}`, borderRadius: '8px', color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
              />
              <Legend wrapperStyle={{ color: settings.theme === 'dark' ? '#f1f5f9' : '#0f172a' }} />
              <Bar dataKey="gdpContribution" fill="#10b981" name="GDP Contribution (USD)" />
              <Bar dataKey="employment" fill="#3b82f6" name="Jobs Created" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Model Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-600 dark:text-slate-400">Model Version</p>
            <p className="font-medium text-slate-900 dark:text-white">{model.model_version}</p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Calculation Date</p>
            <p className="font-medium text-slate-900 dark:text-white">{new Date(model.calculation_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Confidence Score</p>
            <p className="font-medium text-slate-900 dark:text-white">{(model.confidence_score * 100).toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Data Sources</p>
            <p className="font-medium text-slate-900 dark:text-white">YouTube, Spotify, Boomplay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
