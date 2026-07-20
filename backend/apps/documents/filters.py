import django_filters

from .models import Document


class DocumentFilter(django_filters.FilterSet):
	created_at = django_filters.DateFromToRangeFilter()

	class Meta:
		model = Document
		fields = {
			'category': ['exact'],
			'direction': ['exact'],
			'departement': ['exact'],
			'service': ['exact'],
			'dossier': ['exact'],
			'status': ['exact'],
			'priority': ['exact'],
			'is_archived': ['exact'],
			'is_deleted': ['exact'],
			'confidentialite': ['exact'],
		}
