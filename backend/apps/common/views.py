from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from apps.documents.models import Document
from apps.courriers.models import CourrierEntrant, CourrierSortant
from apps.dossiers.models import Dossier

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_search(request):
    """Recherche globale pour Documents, Courriers et Dossiers avec filtres avancés."""
    query = request.query_params.get('q', '')
    search_type = request.query_params.get('type', 'all')  # all|document|courrier|dossier
    category_id = request.query_params.get('category')
    departement_id = request.query_params.get('departement')

    results = {'documents': [], 'courriers': [], 'dossiers': []}

    if not query:
        return Response(results)

    if search_type in ('all', 'document'):
        documents_qs = Document.objects.filter(is_deleted=False).filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )
        if category_id:
            documents_qs = documents_qs.filter(category_id=category_id)
        if departement_id:
            documents_qs = documents_qs.filter(departement_id=departement_id)
        results['documents'] = [{'id': d.pk, 'title': d.title, 'type': 'document', 'status': d.status} for d in documents_qs[:10]]

    if search_type in ('all', 'courrier'):
        entrants = CourrierEntrant.objects.filter(
            Q(objet__icontains=query) | Q(numero__icontains=query) | Q(expediteur__icontains=query)
        )
        sortants = CourrierSortant.objects.filter(
            Q(objet__icontains=query) | Q(numero__icontains=query) | Q(destinataire__icontains=query)
        )
        if departement_id:
            entrants = entrants.filter(direction_destinataire_id=departement_id)
        results['courriers'] = [
            {'id': c.pk, 'numero': c.numero, 'objet': c.objet, 'type': 'courrier-entrant'} for c in entrants[:5]
        ] + [
            {'id': c.pk, 'numero': c.numero, 'objet': c.objet, 'type': 'courrier-sortant'} for c in sortants[:5]
        ]

    if search_type in ('all', 'dossier'):
        dossiers_qs = Dossier.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
        if departement_id:
            dossiers_qs = dossiers_qs.filter(departement_id=departement_id)
        results['dossiers'] = [{'id': d.pk, 'name': d.name, 'type': 'dossier'} for d in dossiers_qs[:5]]

    return Response(results)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_suggestions(request):
    """Auto-complétion / Suggestions."""
    query = request.query_params.get('q', '')
    if not query:
        return Response([])

    suggestions = []
    
    docs = Document.objects.filter(title__icontains=query, is_deleted=False)[:5]
    for d in docs:
        suggestions.append({'id': d.pk, 'text': d.title, 'type': 'document'})
        
    entrants = CourrierEntrant.objects.filter(objet__icontains=query)[:3]
    for c in entrants:
        suggestions.append({'id': c.pk, 'text': c.objet, 'type': 'courrier'})

    return Response(suggestions)
