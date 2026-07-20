import { useState, useEffect } from 'react';
import { directionsService, departementsService, categoriesService } from '../services/organization';

export function useDependentDropdowns() {
  const [directions, setDirections] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loadingDirections, setLoadingDirections] = useState(false);
  const [loadingDepartements, setLoadingDepartements] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    loadDirections();
    loadCategories();
  }, []);

  const loadDirections = async () => {
    setLoadingDirections(true);
    try {
      const data = await directionsService.getAll({ page_size: 200, status: 'actif' });
      setDirections(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDirections(false);
    }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoriesService.getAll({ page_size: 200, status: 'actif' });
      setCategories(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchDepartements = async (directionId: number) => {
    if (!directionId) {
      setDepartements([]);
      setServices([]);
      return;
    }
    setLoadingDepartements(true);
    try {
      const data = await directionsService.getDepartements(directionId);
      setDepartements(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDepartements(false);
    }
    setServices([]); // Reset services when direction changes
  };

  const fetchServices = async (departementId: number) => {
    if (!departementId) {
      setServices([]);
      return;
    }
    setLoadingServices(true);
    try {
      const data = await departementsService.getServices(departementId);
      setServices(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingServices(false);
    }
  };

  return {
    directions,
    departements,
    services,
    categories,
    fetchDepartements,
    fetchServices,
    loadingDirections,
    loadingDepartements,
    loadingServices,
    loadingCategories,
  };
}
