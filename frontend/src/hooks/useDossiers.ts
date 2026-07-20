import { useState, useEffect } from 'react';
import { dossiersService } from '../services/dossiers';
import { Dossier } from '../types';

export const useDossiers = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDossiers = async () => {
    setLoading(true);
    try {
      const data = await dossiersService.getDossiers();
      setDossiers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, []);

  return { dossiers, loading, error, refetch: fetchDossiers };
};
