export const theme = {
  colors: {
    primary: '#4F72F9',
    secondary: '#7C5BE6',
    sky: 'linear-gradient(155deg,#6D9DC3 0%,#8CB2D2 18%,#A8C4DF 36%,#BDD3EB 54%,#CCDFF0 70%,#D3E3EF 84%,#D7E6EE 100%)',
    outer: '#85A4BC',
    border: 'rgba(255,255,255,0.48)',
    white: 'rgba(255,255,255,0.93)',
    whiteSoft: 'rgba(255,255,255,0.60)',
    text: '#1B2946',
    textSoft: '#455776',
    textMuted: '#697892',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  shadow: {
    xl: '0 28px 72px rgba(10,20,50,0.22),0 6px 24px rgba(10,20,50,0.12)',
    lg: '0 12px 40px rgba(10,20,50,0.18)',
    sm: '0 3px 10px rgba(10,20,50,0.07)',
  },
};

export const glass = (alpha = 0.25, borderAlpha = 0.48) => ({
  background: `rgba(255,255,255,${alpha})`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid rgba(255,255,255,${borderAlpha})`,
});

export const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: 'rgba(34,197,94,0.14)', color: '#155E34', label: 'Approuvé' },
  pending: { bg: 'rgba(245,158,11,0.14)', color: '#78350F', label: 'En attente' },
  draft: { bg: 'rgba(107,114,153,0.14)', color: '#374151', label: 'Brouillon' },
  rejected: { bg: 'rgba(239,68,68,0.14)', color: '#7F1D1D', label: 'Rejeté' },
};

export const roleStyles: Record<string, { bg: string; color: string; label: string }> = {
  admin: { bg: 'rgba(79,114,249,0.15)', color: '#3455D4', label: 'Admin' },
  manager: { bg: 'rgba(124,91,230,0.15)', color: '#6040C8', label: 'Manager' },
  employee: { bg: 'rgba(107,114,153,0.12)', color: '#374151', label: 'Employé' },
  guest: { bg: 'rgba(107,114,153,0.08)', color: '#6B7280', label: 'Invité' },
};

export const actionStyles: Record<string, { bg: string; color: string; label: string }> = {
  upload: { bg: 'rgba(34,197,94,0.14)', color: '#155E34', label: 'Upload' },
  download: { bg: 'rgba(59,130,246,0.14)', color: '#1E40AF', label: 'Téléchargement' },
  view: { bg: 'rgba(124,91,230,0.14)', color: '#5B21B6', label: 'Consultation' },
  approve: { bg: 'rgba(34,197,94,0.14)', color: '#155E34', label: 'Approbation' },
  login: { bg: 'rgba(245,158,11,0.14)', color: '#78350F', label: 'Connexion' },
  share: { bg: 'rgba(249,115,22,0.14)', color: '#9A3412', label: 'Partage' },
  delete: { bg: 'rgba(239,68,68,0.14)', color: '#7F1D1D', label: 'Suppression' },
};

export const fileTypeColors: Record<string, string> = {
  pdf: '#EF4444',
  docx: '#3B82F6',
  xlsx: '#22C55E',
  pptx: '#F59E0B',
  jpg: '#8B5CF6',
  png: '#8B5CF6',
};

export const fileColor = (type: string) => fileTypeColors[type] ?? '#6B7A99';
