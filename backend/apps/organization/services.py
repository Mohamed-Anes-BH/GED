from django.db.models import Count

from .models import Direction, Departement, Service, Categorie, Tag, Correspondant, Site, Batiment, Bureau, Armoire, Etagere, BoiteArchive


def get_direction_tree():
	tree = []
	for direction in Direction.objects.all().order_by('name'):
		departments = []
		for departement in direction.departements.all().order_by('name'):
			services = list(departement.services.all().order_by('name').values('id', 'name', 'code', 'is_active'))
			departments.append({
				'id': departement.id,
				'name': departement.name,
				'code': departement.code,
				'is_active': departement.is_active,
				'services': services,
			})
		tree.append({
			'id': direction.id,
			'name': direction.name,
			'code': direction.code,
			'is_active': direction.is_active,
			'departements': departments,
		})
	return tree


def get_storage_tree():
	return [
		{
			'id': site.id,
			'name': site.name,
			'batiments': [
				{
					'id': batiment.id,
					'name': batiment.name,
					'bureaux': [
						{
							'id': bureau.id,
							'name': bureau.name,
							'armoires': [
								{
									'id': armoire.id,
									'name': armoire.name,
									'etageres': [
										{
											'id': etagere.id,
											'name': etagere.name,
											'boites': list(etagere.boites.all().values('id', 'code', 'label', 'status')),
										}
										for etagere in armoire.etageres.all().order_by('position')
									],
								}
								for armoire in bureau.armoires.all().order_by('name')
							],
						}
						for bureau in batiment.bureaux.all().order_by('name')
					],
				}
				for batiment in site.batiments.all().order_by('name')
			],
		}
		for site in Site.objects.all().order_by('name')
	]


def get_archive_capacity_stats():
	return list(
		BoiteArchive.objects.values('status').annotate(count=Count('id')).order_by('status')
	)


def cascade_archive_box(box, status='archivee'):
	box.status = status
	box.save(update_fields=['status'])
	return box

