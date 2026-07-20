import django_filters

from .models import CourrierEntrant, CourrierSortant


class CourrierEntrantFilter(django_filters.FilterSet):
	date_reception = django_filters.DateFromToRangeFilter()

	class Meta:
		model = CourrierEntrant
		fields = {
			'statut': ['exact'],
			'priorite': ['exact'],
			'direction': ['exact'],
			'assigned_to': ['exact'],
			'departement': ['exact'],
			'service': ['exact'],
		}


class CourrierSortantFilter(django_filters.FilterSet):
	date_envoi = django_filters.DateFromToRangeFilter()

	class Meta:
		model = CourrierSortant
		fields = {
			'statut': ['exact'],
			'priorite': ['exact'],
			'auteur': ['exact'],
			'departement': ['exact'],
			'service': ['exact'],
		}
