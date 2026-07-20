import { useState, useEffect } from 'react';
import { workflowsService } from '../services/workflows';
import api from '../utils/api';

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wfData, kpiData] = await Promise.all([
        workflowsService.getWorkflows(),
        workflowsService.getWorkflowKpis().catch(() => null)
      ]);
      setWorkflows(wfData);
      if (kpiData) setKpis(kpiData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startInstance = async (workflowId: number, documentId: number) => {
    await api.post('/workflows/executions/start_instance/', {
      workflow: workflowId,
      document: documentId,
    });
    fetchData();
  };

  const validateStep = async (executionId: number, comment: string) => {
    await api.post(`/workflows/executions/${executionId}/validate/`, { comment });
    fetchData();
  };

  const rejectStep = async (executionId: number, comment: string) => {
    await api.post(`/workflows/executions/${executionId}/reject/`, { comment });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { workflows, kpis, loading, startInstance, validateStep, rejectStep, refetch: fetchData };
};
