DOCUMENT_STATUSES = {
	'brouillon': 'Brouillon',
	'en_revision': 'En révision',
	'valide': 'Validé',
	'archive': 'Archivé',
	'rejete': 'Rejeté',
}

COURRIER_PRIORITIES = {
	'basse': 'Basse',
	'normale': 'Normale',
	'haute': 'Haute',
	'urgente': 'Urgente',
}

WORKFLOW_STATUSES = {
	'brouillon': 'Brouillon',
	'actif': 'Actif',
	'inactif': 'Inactif',
	'archive': 'Archivé',
}

FILE_TYPES = {
	'pdf': 'application/pdf',
	'image': ('image/jpeg', 'image/png', 'image/webp'),
	'document': (
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	),
}

OCR_LANGUAGES = {
	'fra': 'Français',
	'eng': 'Anglais',
	'ara': 'Arabe',
}

NOTIFICATION_TYPES = {
	'document': 'Document',
	'courrier': 'Courrier',
	'workflow': 'Workflow',
	'system': 'Système',
	'user': 'Utilisateur',
}

ACTION_TYPES = {
	'create': 'Création',
	'read': 'Lecture',
	'update': 'Mise à jour',
	'delete': 'Suppression',
	'login': 'Connexion',
	'logout': 'Déconnexion',
	'download': 'Téléchargement',
	'share': 'Partage',
	'archive': 'Archivage',
	'validate': 'Validation',
	'reject': 'Rejet',
}
