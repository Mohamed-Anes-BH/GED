import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard';

export const useDashboard = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [kpiData, docsData, activityData, evolutionData] = await Promise.all([
          dashboardService.getKpis(),
          dashboardService.getRecentDocuments(),
          dashboardService.getRecentActivity(),
          dashboardService.getChartData()
        ]);
        
        setKpis(kpiData);
        setRecentDocs(docsData);
        setActivities(activityData);
        
        // Format evolution data for Recharts
        if (evolutionData?.documents) {
          const formattedChart = evolutionData.documents.map((d: any) => ({
            name: new Date(d.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            documents: d.count,
            courriers: Math.floor(Math.random() * (d.count || 5)) // Mock courriers until evolution returns it mapped
          }));
          setChartData(formattedChart);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Dashboard Hook Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  return { kpis, recentDocs, activities, chartData, loading };
};
