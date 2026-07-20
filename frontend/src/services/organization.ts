import api from '../utils/api';

const createCrudService = (basePath: string) => ({
  getAll: async (params?: any) => {
    const response = await api.get(basePath, { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`${basePath}${id}/`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post(basePath, data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`${basePath}${id}/`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`${basePath}${id}/`);
  },
});

export const directionsService = {
  ...createCrudService('/organization/directions/'),
  getDepartements: async (id: number) => {
    const response = await api.get(`/organization/directions/${id}/departements/`);
    return response.data;
  }
};

export const departementsService = {
  ...createCrudService('/organization/departements/'),
  getServices: async (id: number) => {
    const response = await api.get(`/organization/departements/${id}/services/`);
    return response.data;
  }
};

export const servicesService      = createCrudService('/organization/services/');
export const categoriesService    = createCrudService('/organization/categories/');
export const tagsService          = createCrudService('/organization/tags/');
export const correspondantsService = createCrudService('/organization/correspondants/');
export const sitesService         = createCrudService('/organization/sites/');
export const batimentsService     = createCrudService('/organization/batiments/');
export const bureauxService       = createCrudService('/organization/bureaux/');
export const armoiresService      = createCrudService('/organization/armoires/');
export const etageresService      = createCrudService('/organization/etageres/');
export const boitesArchivesService = createCrudService('/organization/boites-archives/');
export const physicalLocationsService = createCrudService('/organization/physical-locations/');
