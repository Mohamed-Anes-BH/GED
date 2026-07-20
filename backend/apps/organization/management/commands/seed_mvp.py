from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.organization.models import Direction, Departement, Service, Categorie, Tag, BoiteArchive
from apps.dossiers.models import Dossier
from apps.users.models import Role

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with MVP dropdown values for AgrOdiv GED'

    def handle(self, *args, **options):
        self.stdout.write("Starting MVP database seeding...")
        
        # 0. System User
        sys_user, _ = User.objects.get_or_create(
            email='system@agrodiv.dz',
            defaults={
                'first_name': 'Système',
                'last_name': 'AgrOdiv',
                'is_active': False
            }
        )

        # 1. Categories
        categories = ['Administratif', 'Juridique', 'RH', 'Finance', 'Technique', 'Autre']
        for cat in categories:
            code = cat.upper().replace(' ', '_')
            Categorie.objects.get_or_create(code=code, defaults={'name': cat})
        
        # 2. Dossiers (Folders)
        dossiers = ['Administration', 'RH', 'Finance', 'Juridique', 'Contrats', 'Factures', 'Rapports', 'Projets', 'Archives']
        for d in dossiers:
            Dossier.objects.get_or_create(
                name=d, 
                defaults={
                    'dossier_type': 'standard',
                    'created_by': sys_user
                }
            )

        # 3. Tags
        tags = ['Urgent', 'Contrat', 'Facture', 'RH', 'Projet', 'Signature', 'Ministère', 'Fournisseur', 'Client']
        for t in tags:
            Tag.objects.get_or_create(name=t, defaults={'color': '#f97316'})

        # 4. Roles
        roles = ['Administrateur', 'Responsable', 'Employé']
        for r in roles:
            Role.objects.get_or_create(name=r, defaults={'description': f'Role: {r}'})

        # 5. Organizations (Direction -> Departement -> Service)
        orgs = {
            'Direction Générale': {
                'code': 'DG',
                'depts': {
                    'Secrétariat Général': ['SG'],
                    'Planification': ['PL'],
                }
            },
            'Direction RH': {
                'code': 'DRH',
                'depts': {
                    'Administration RH': ['Gestion du personnel', 'Paie'],
                    'Recrutement': ['Recrutement', 'Intégration'],
                    'Formation': [],
                }
            },
            'Direction Financière': {
                'code': 'DFI',
                'depts': {
                    'Comptabilité': ['Générale', 'Clients', 'Fournisseurs'],
                    'Trésorerie': [],
                }
            },
            'Direction Informatique': {
                'code': 'DIT',
                'depts': {
                    'Développement': ['Web', 'Mobile', 'API'],
                    'Infrastructure': ['Réseau', 'Systèmes'],
                    'Support': ['Help Desk'],
                }
            },
            'Direction Juridique': {
                'code': 'DJU',
                'depts': {
                    'Affaires Juridiques': ['Contrats', 'Contentieux'],
                }
            },
            'Direction Commerciale': {
                'code': 'DCO',
                'depts': {
                    'Ventes': ['B2B', 'B2C'],
                    'Marketing': ['Communication', 'Digital'],
                }
            }
        }

        import uuid
        for dir_name, dir_data in orgs.items():
            dir_code = dir_data['code']
            direction, _ = Direction.objects.get_or_create(code=dir_code, defaults={'name': dir_name})
            for dept_name, svcs in dir_data['depts'].items():
                dept_code = dept_name[:3].upper() + '-' + dir_code
                dept, _ = Departement.objects.get_or_create(
                    code=dept_code, 
                    defaults={'direction': direction, 'name': dept_name}
                )
                for svc_name in svcs:
                    svc_code = svc_name[:3].upper() + '-' + dept_code
                    Service.objects.get_or_create(
                        code=svc_code, 
                        defaults={'departement': dept, 'name': svc_name}
                    )

        # 6. Physical Archive (Site, Batiment, Bureau)
        # Using BoiteArchive for mock MVP representation if needed, though frontend currently falls back to disabled static fields for this anyway.

        self.stdout.write(self.style.SUCCESS("Successfully seeded MVP dropdown values!"))
