export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined) return '0 B';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    brouillon: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    en_revision: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    valide: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    archive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    
    nouveau: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    lu: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    en_cours: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    traite: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    
    en_validation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    envoye: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    signe: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
  };
  return map[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
};
