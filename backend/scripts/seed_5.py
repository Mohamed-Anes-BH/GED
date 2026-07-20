import os
import random
from django.core.files import File
from apps.users.models import User, Role, Permission
from apps.organization.models import Direction, Departement, Service, Categorie, Tag, Correspondant, Site, Batiment, Bureau, Armoire, Etagere, BoiteArchive
from apps.documents.models import Document, DocumentFile
from apps.dossiers.models import Dossier
from apps.courriers.models import CourrierEntrant, CourrierSortant
from apps.workflow.models import Workflow
from apps.messagerie.models import Conversation, Message
from apps.notifications.models import Notification
from apps.audit.models import AuditLog
from apps.ocr.models import OcrJob

def ensure_5(model_class, create_fn):
    count = model_class.objects.count()
    if count < 5:
        print(f"Creating {5 - count} {model_class.__name__}s...")
        for i in range(5 - count):
            create_fn(i)

admin_user = User.objects.filter(is_superuser=True).first()
if not admin_user:
    admin_user = User.objects.create_superuser('admin_seed_5@agrodiv.dz', 'admin')

print("Seeding Users and Roles...")
def make_role(i):
    Role.objects.create(name=f"Rôle {i+1}", description="Test")
ensure_5(Role, make_role)

roles = list(Role.objects.all())
def make_user(i):
    u = User.objects.create_user(email=f"utilisateur_{i+1}@agrodiv.dz", password="password")
    u.role = roles[i % len(roles)]
    u.first_name = f"Prénom{i+1}"
    u.last_name = f"Nom{i+1}"
    u.save()
ensure_5(User, make_user)
users = list(User.objects.all())

print("Seeding Organization...")
ensure_5(Direction, lambda i: Direction.objects.create(name=f"Direction {i+1}", code=f"DIR{i+1}"))
directions = list(Direction.objects.all())
ensure_5(Departement, lambda i: Departement.objects.create(name=f"Département {i+1}", code=f"DEP{i+1}", direction=random.choice(directions)))
departements = list(Departement.objects.all())
ensure_5(Service, lambda i: Service.objects.create(name=f"Service {i+1}", code=f"SRV{i+1}", departement=random.choice(departements)))

ensure_5(Categorie, lambda i: Categorie.objects.create(name=f"Catégorie {i+1}", code=f"CAT{i+1}", color="#f44336"))
categories = list(Categorie.objects.all())
ensure_5(Tag, lambda i: Tag.objects.create(name=f"Tag {i+1}", color="#2196f3"))

ensure_5(Correspondant, lambda i: Correspondant.objects.create(name=f"Entité Correspondante {i+1}", email=f"entite{i+1}@ext.com", type="externe"))
ensure_5(Site, lambda i: Site.objects.create(name=f"Site {i+1}"))
sites = list(Site.objects.all())
ensure_5(Batiment, lambda i: Batiment.objects.create(name=f"Bâtiment {i+1}", site=random.choice(sites)))
batiments = list(Batiment.objects.all())
ensure_5(Bureau, lambda i: Bureau.objects.create(name=f"Bureau {i+1}", batiment=random.choice(batiments)))
bureaux = list(Bureau.objects.all())
ensure_5(Armoire, lambda i: Armoire.objects.create(name=f"Armoire {i+1}", bureau=random.choice(bureaux)))
armoires = list(Armoire.objects.all())
ensure_5(Etagere, lambda i: Etagere.objects.create(name=f"Etagere {i+1}", armoire=random.choice(armoires), position=1))
etageres = list(Etagere.objects.all())
ensure_5(BoiteArchive, lambda i: BoiteArchive.objects.create(code=f"BA-{i+1}", label=f"Boite {i+1}", etagere=random.choice(etageres)))

print("Seeding Dossiers...")
ensure_5(Dossier, lambda i: Dossier.objects.create(name=f"Dossier de test {i+1}", description="...", created_by=admin_user))
dossiers = list(Dossier.objects.all())

print("Seeding Documents and attaching the PDF...")
PDF_PATH = '/app/test_doc_5.pdf'
def make_document(i):
    doc = Document.objects.create(
        title=f"Document PDF de Test {i+1}",
        description=f"Contenu de test {i+1}",
        category=random.choice(categories),
        created_by=admin_user,
        dossier=random.choice(dossiers)
    )
    if os.path.exists(PDF_PATH):
        with open(PDF_PATH, 'rb') as f:
            DocumentFile.objects.create(
                document=doc,
                file=File(f, name=f"td2-cspp_instance_{i+1}.pdf"),
                filename=f"td2-cspp_instance_{i+1}.pdf",
                mime_type="application/pdf",
                size=os.path.getsize(PDF_PATH),
                checksum="dummy_checksum"
            )
ensure_5(Document, make_document)

print("Seeding Courriers...")
def make_courrier_entrant(i):
    CourrierEntrant.objects.create(
        numero=f"E-2026-{i+1}",
        objet=f"Courrier Entrant Test {i+1}",
        date_reception="2026-07-01",
        created_by=admin_user
    )
ensure_5(CourrierEntrant, make_courrier_entrant)

def make_courrier_sortant(i):
    CourrierSortant.objects.create(
        numero=f"S-2026-{i+1}",
        objet=f"Courrier Sortant Test {i+1}",
        created_by=admin_user
    )
ensure_5(CourrierSortant, make_courrier_sortant)

print("Seeding Messagerie...")
def make_conversation(i):
    conv = Conversation.objects.create(subject=f"Sujet de discussion {i+1}")
    conv.participants.add(admin_user)
    if users:
        conv.participants.add(random.choice(users))
ensure_5(Conversation, make_conversation)
conversations = list(Conversation.objects.all())

def make_message(i):
    Message.objects.create(
        conversation=conversations[i % len(conversations)],
        sender=admin_user,
        content=f"Ceci est le message de test n°{i+1}"
    )
ensure_5(Message, make_message)

print("Seeding Workflows...")
ensure_5(Workflow, lambda i: Workflow.objects.create(name=f"Workflow Test {i+1}", description="Test", created_by=admin_user))

print("Seeding Notifications...")
ensure_5(Notification, lambda i: Notification.objects.create(user=admin_user, title=f"Alerte {i+1}", message="Message notif"))

print("Seeding Logs & OCR Jobs...")
ensure_5(AuditLog, lambda i: AuditLog.objects.create(user=admin_user, action="CREATE", model_name="Document", object_id=1, description=f"Log {i+1}"))
ensure_5(OcrJob, lambda i: OcrJob.objects.create(language="fra", source_file=f"file_{i+1}.pdf", created_by=admin_user, document=Document.objects.first()))

print("✅ TOUTES LES TABLES ONT MAINTENANT AU MOINS 5 INSTANCES !")
