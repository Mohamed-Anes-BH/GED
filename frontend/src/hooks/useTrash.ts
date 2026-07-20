import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const useTrash = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ documents: 0, dossiers: 0, courriers: 0, total: 0 });

  const fetchTrash = useCallback(async () => {
    try {
      setLoading(true);
      const [docsRes, dossiersRes, courriersEntRes, courriersSortRes] = await Promise.all([
        api.get('/documents/trash/').catch(() => ({ data: [] })),
        api.get('/dossiers/trash/').catch(() => ({ data: [] })),
        api.get('/courriers/entrants/trash/').catch(() => ({ data: [] })),
        api.get('/courriers/sortants/trash/').catch(() => ({ data: [] })),
      ]);

      const docs = (docsRes.data.results || docsRes.data || []).map((d: any) => ({ ...d, _type: 'document' }));
      const dossiers = (dossiersRes.data.results || dossiersRes.data || []).map((d: any) => ({ ...d, _type: 'dossier' }));
      const courriersEnt = (courriersEntRes.data.results || courriersEntRes.data || []).map((d: any) => ({ ...d, _type: 'courrier_entrant' }));
      const courriersSort = (courriersSortRes.data.results || courriersSortRes.data || []).map((d: any) => ({ ...d, _type: 'courrier_sortant' }));

      const all = [...docs, ...dossiers, ...courriersEnt, ...courriersSort];
      all.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

      setItems(all);
      setStats({
        documents: docs.length,
        dossiers: dossiers.length,
        courriers: courriersEnt.length + courriersSort.length,
        total: all.length,
      });
    } catch (err) {
      console.error('Erreur chargement corbeille:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const restoreItem = async (item: any) => {
    const endpoints: Record<string, string> = {
      document: `/documents/${item.id}/restore/`,
      dossier: `/dossiers/${item.id}/restore/`,
      courrier_entrant: `/courriers/entrants/${item.id}/restore/`,
      courrier_sortant: `/courriers/sortants/${item.id}/restore/`,
    };
    await api.post(endpoints[item._type]);
    fetchTrash();
  };

  const permanentDelete = async (item: any) => {
    const endpoints: Record<string, string> = {
      document: `/documents/${item.id}/permanent_delete/`,
      dossier: `/dossiers/${item.id}/permanent/`,
      courrier_entrant: `/courriers/entrants/${item.id}/permanent/`,
      courrier_sortant: `/courriers/sortants/${item.id}/permanent/`,
    };
    await api.delete(endpoints[item._type]);
    fetchTrash();
  };

  const emptyTrash = async () => {
    await Promise.all([
      api.post('/documents/trash/empty/').catch(console.error),
      api.post('/dossiers/trash/empty/').catch(console.error),
      api.post('/courriers/entrants/trash/empty/').catch(console.error),
      api.post('/courriers/sortants/trash/empty/').catch(console.error),
    ]);
    fetchTrash();
  };

  return { items, loading, stats, restoreItem, permanentDelete, emptyTrash, refetch: fetchTrash };
};
