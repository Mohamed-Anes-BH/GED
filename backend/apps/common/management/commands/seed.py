from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User, Role
from apps.organization.models import Direction, Departement, Service, Categorie, Tag
from apps.documents.models import Document
from apps.courriers.models import CourrierEntrant, CourrierSortant
from apps.dossiers.models import Dossier
from datetime import timedelta
from django.db import transaction

class Command(BaseCommand):
    help = 'Seed the database with initial mock data.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")
        try:
            with transaction.atomic():
                self.create_roles_and_users()
                self.create_organization()
                self.create_dossiers()
                self.create_tags_and_categories()
                self.create_documents()
                self.create_courriers()
            self.stdout.write(self.style.SUCCESS("✅ Database seeded successfully!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error during seeding: {e}"))

    def create_roles_and_users(self):
        # Admin Role
        admin_role, _ = Role.objects.get_or_create(name='Super Admin', defaults={'description': 'System admin', 'is_system': True})
        employe_role, _ = Role.objects.get_or_create(name='Employé', defaults={'description': 'Regular employe', 'is_system': True})
        manager_role, _ = Role.objects.get_or_create(name='Manager', defaults={'description': 'Manager', 'is_system': True})
        
        # Ensure 'admin@agrodiv.dz' has the role Super Admin
        admin_user, _ = User.objects.get_or_create(email='admin@agrodiv.dz', defaults={
            'first_name': 'Super',
            'last_name': 'Admin',
            'is_superuser': True,
            'is_staff': True,
            'is_active': True,
        })
        if not admin_user.password:
            admin_user.set_password('admin123')
        admin_user.role = admin_role
        admin_user.save()

        # Seed other users
        users_data = [
            ('sofiane.hamidi@agrodiv.dz', 'Sofiane', 'Hamidi', admin_role),
            ('m.benali@agrodiv.dz', 'Meryem', 'Benali', manager_role),
            ('y.elamrani@agrodiv.dz', 'Youssef', 'El Amrani', manager_role),
            ('k.lahbabi@agrodiv.dz', 'Khadija', 'Lahbabi', employe_role),
            ('t.ziani@agrodiv.dz', 'Tariq', 'Ziani', employe_role),
        ]
        self.users = []
        for email, first, last, role in users_data:
            user, created = User.objects.get_or_create(email=email, defaults={
                'first_name': first,
                'last_name': last,
                'role': role,
                'is_active': True,
            })
            if created:
                user.set_password('password123')
                user.save()
            self.users.append(user)

    def create_organization(self):
        self.dg, _ = Direction.objects.get_or_create(name="Direction Générale", code="DG")
        self.df, _ = Direction.objects.get_or_create(name="Direction Financière", code="DF")
        self.drh, _ = Direction.objects.get_or_create(name="Direction des RH", code="DRH")

        self.dep_it, _ = Departement.objects.get_or_create(name="Département IT", code="DIT", direction=self.dg)
        self.dep_compta, _ = Departement.objects.get_or_create(name="Comptabilité", code="DCOMP", direction=self.df)
        
        self.srv_dev, _ = Service.objects.get_or_create(name="Service Développement", code="SDEV", departement=self.dep_it)
        
        # Assign users to departements
        if len(self.users) > 0:
            self.users[0].department = self.dep_it
            self.users[0].service = self.srv_dev
            self.users[0].save()

    def create_dossiers(self):
        self.dossier_rh, _ = Dossier.objects.get_or_create(name="Dossiers Collaborateurs", direction=self.drh, created_by=self.users[0])
        self.dossier_factures, _ = Dossier.objects.get_or_create(name="Factures 2024", departement=self.dep_compta, created_by=self.users[1])

    def create_tags_and_categories(self):
        self.cat_contrat, _ = Categorie.objects.get_or_create(name="Contrats", code="CAT-CONTRAT", color="#F59E0B")
        self.cat_rapport, _ = Categorie.objects.get_or_create(name="Rapports", code="CAT-RAPPORT", color="#3B82F6")
        self.cat_finance, _ = Categorie.objects.get_or_create(name="Finance", code="CAT-FIN", color="#10B981")
        
        self.tag_urgent, _ = Tag.objects.get_or_create(name="Urgent", color="#EF4444")
        self.tag_archive, _ = Tag.objects.get_or_create(name="Archive", color="#9CA3AF")

    def create_documents(self):
        docs_data = [
            ("Contrat de prestation Cloud", self.cat_contrat, "active"),
            ("Rapport Annuel 2023", self.cat_rapport, "valide"),
            ("Facture Fournisseur X", self.cat_finance, "en_revision"),
            ("Procédure de sécurité", self.cat_rapport, "valide"),
            ("Note de Frais Mars", self.cat_finance, "rejete"),
        ]
        
        now = timezone.now()
        for idx, (title, cat, status) in enumerate(docs_data):
            doc, created = Document.objects.get_or_create(
                title=title,
                defaults={
                    'description': f"Ceci est un document mock pour {title}",
                    'category': cat,
                    'direction': self.dg,
                    'departement': self.dep_it,
                    'created_by': self.users[idx % len(self.users)],
                    'status': status,
                    'created_at': now - timedelta(days=idx*2)
                }
            )
            if created:
                if "Contrat" in title:
                    doc.tags.add(self.tag_urgent)

    def create_courriers(self):
        ce, _ = CourrierEntrant.objects.get_or_create(
            numero="CE-2024-001",
            defaults={
                'expediteur': "Ministère de l'Agriculture",
                'objet': "Réglementation sur les subventions",
                'date_reception': timezone.now().date() - timedelta(days=2),
                'statut': "non_lu",
                'priorite': "haute",
                'created_by': self.users[0]
            }
        )
        cs, _ = CourrierSortant.objects.get_or_create(
            numero="CS-2024-001",
            defaults={
                'destinataire': "Wilaya d'Alger",
                'objet': "Demande d'autorisation de transport",
                'date_envoi': timezone.now().date(),
                'statut': "brouillon",
                'auteur': self.users[1],
                'created_by': self.users[1]
            }
        )
