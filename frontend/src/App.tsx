import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { BeatsAIDashboard } from './pages/BeatsAIDashboard';
import { ArtistsDashboard } from './pages/ArtistsDashboard';
import { TrendsDashboard } from './pages/TrendsDashboard';
import { EconomicImpactDashboard } from './pages/EconomicImpactDashboard';
import { SourcesManagementDashboard } from './pages/SourcesManagementDashboard';
import { DataManagementDashboard } from './pages/DataManagementDashboard';
import { SettingsDashboard } from './pages/SettingsDashboard';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'beats-ai':
        return <BeatsAIDashboard />;
      case 'artists':
        return <ArtistsDashboard />;
      case 'trends':
        return <TrendsDashboard />;
      case 'economic':
        return <EconomicImpactDashboard />;
      case 'sources':
        return <SourcesManagementDashboard />;
      case 'data':
        return <DataManagementDashboard />;
      case 'settings':
        return <SettingsDashboard />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </DashboardLayout>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
