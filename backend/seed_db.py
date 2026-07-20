import os
import django
import sys
from datetime import timedelta
from django.utils import timezone

# Configurer Django pour pouvoir utiliser les modèles
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import Role, Permission
from apps.organization.models import Direction, Departement, Service, Categorie
from apps.documents.models import Document
from apps.dossiers.models import Dossier
from apps.courriers.models import CourrierEntrant, CourrierSortant, Diffusion, DiffusionDestinataire

User = get_user_model()

def run():
    print("🧹 Nettoyage de la base de données...")
    from apps.audit.models import AuditLog
    AuditLog.objects.all().delete()
    CourrierEntrant.objects.all().delete()
    CourrierSortant.objects.all().delete()
    Document.objects.all().delete()
    Dossier.objects.all().delete()
    User.objects.all().delete()
    Role.objects.all().delete()
    Direction.objects.all().delete()
    Categorie.objects.all().delete()

    print("🌱 Création des Rôles...")
    role_admin = Role.objects.create(name='Super Admin', description='Accès total', is_system=True)
    role_manager = Role.objects.create(name='Manager', description='Gestion département', is_system=True)
    role_employe = Role.objects.create(name='Employé', description='Accès standard', is_system=True)

    Permission.objects.create(role=role_admin, resource='all', can_create=True, can_read=True, can_update=True, can_delete=True, can_approve=True)
    Permission.objects.create(role=role_manager, resource='department', can_create=True, can_read=True, can_update=True, can_approve=True)
    Permission.objects.create(role=role_employe, resource='personal', can_create=True, can_read=True)

    print("🏢 Création de l'organisation...")
    dir_fi = Direction.objects.create(name="Direction Financière", code="DF")
    dir_rh = Direction.objects.create(name="Direction des Ressources Humaines", code="DRH")

    dep_compta = Departement.objects.create(name="Comptabilité", code="COMPTA", direction=dir_fi)
    dep_recrutement = Departement.objects.create(name="Recrutement", code="RECRUT", direction=dir_rh)

    cat_facture = Categorie.objects.create(name="Facture", code="FACT", color="#ff0000")
    cat_contrat = Categorie.objects.create(name="Contrat", code="CONT", color="#00ff00")

    print("👥 Création des utilisateurs de test...")
    admin1 = User.objects.create_superuser(email='admin@agrodiv.dz', password='admin123', first_name='Super', last_name='Admin', role=role_admin)
    admin2 = User.objects.create_superuser(email='sofiane.hamidi@agrodiv.dz', password='password123', first_name='Sofiane', last_name='Hamidi', role=role_admin)

    manager1 = User.objects.create_user(email='m.benali@agrodiv.dz', password='password123', first_name='Meryem', last_name='Benali', role=role_manager, department=dep_compta)
    manager2 = User.objects.create_user(email='y.elamrani@agrodiv.dz', password='password123', first_name='Youssef', last_name='El Amrani', role=role_manager, department=dep_recrutement)

    emp1 = User.objects.create_user(email='k.lahbabi@agrodiv.dz', password='password123', first_name='Khadija', last_name='Lahbabi', role=role_employe, department=dep_compta)
    emp2 = User.objects.create_user(email='t.ziani@agrodiv.dz', password='password123', first_name='Tariq', last_name='Ziani', role=role_employe, department=dep_recrutement)

    print("📁 Création de dossiers...")
    dossier1 = Dossier.objects.create(name="Factures 2026", direction=dir_fi, departement=dep_compta, responsable=manager1, created_by=admin1)
    dossier2 = Dossier.objects.create(name="Recrutements Q3 2026", direction=dir_rh, departement=dep_recrutement, responsable=manager2, created_by=admin1)

    print("📄 Création de documents...")
    doc1 = Document.objects.create(title="Facture Fournisseur A", category=cat_facture, dossier=dossier1, status='valide', priority='urgente', confidentialite='interne', created_by=manager1)
    doc2 = Document.objects.create(title="Contrat de travail TZ", category=cat_contrat, dossier=dossier2, status='en_revision', priority='normale', confidentialite='confidentiel', created_by=manager2)

    print("✉️ Création de courriers...")
    courrier_entrant = CourrierEntrant.objects.create(numero="CE-2026-001", expediteur="Ministère de l'Agriculture", date_reception=timezone.now().date(), objet="Directive 2026", priorite="haute", statut="en_cours", direction=dir_fi, assigned_to=manager1, created_by=admin1)
    courrier_sortant = CourrierSortant.objects.create(numero="CS-2026-001", destinataire="Partenaire X", objet="Réponse offre", statut="brouillon", priorite="normale", departement=dep_compta, auteur=emp1, created_by=emp1)

    print("📢 Création de diffusions...")
    diffusion = Diffusion.objects.create(courrier_type='entrant', courrier_id=courrier_entrant.id, note="Pour lecture urgente.", created_by=admin1)
    DiffusionDestinataire.objects.create(diffusion=diffusion, user=manager1, lu=False)
    DiffusionDestinataire.objects.create(diffusion=diffusion, user=manager2, lu=True, date_lecture=timezone.now())

    print("✅ Seed terminé avec succès !")

if __name__ == '__main__':
    run()
