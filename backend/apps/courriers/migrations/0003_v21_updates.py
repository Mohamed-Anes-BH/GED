"""
Migration v2.1 for courriers app:
1. CourrierEntrant : ajout is_deleted, deleted_at
2. CourrierSortant : ajout is_deleted, deleted_at
3. Diffusion : restructuration (drop GenericFK + M2M, add courrier_type/courrier_id/note/date_expiration)
4. DiffusionDestinataire : nouvelle table de suivi de lecture individuel
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courriers', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ─── 1. CourrierEntrant: Corbeille ──────────────────────────────────────
        migrations.AddField(
            model_name='courrierentrant',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='courrierentrant',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name='courrierentrant',
            index=models.Index(fields=['is_deleted'], name='courriers_entrant_is_deleted_idx'),
        ),

        # ─── 2. CourrierSortant: Corbeille ──────────────────────────────────────
        migrations.AddField(
            model_name='courriersortant',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='courriersortant',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name='courriersortant',
            index=models.Index(fields=['is_deleted'], name='courriers_sortant_is_deleted_idx'),
        ),

        # ─── 3. Diffusion: Restructuration v2.1 ─────────────────────────────────
        # Supprimer l'ancien M2M destinataires
        migrations.RemoveField(
            model_name='diffusion',
            name='destinataires',
        ),
        # Supprimer la GenericFK (content_type + object_id)
        migrations.RemoveField(
            model_name='diffusion',
            name='content_type',
        ),
        migrations.RemoveField(
            model_name='diffusion',
            name='object_id',
        ),
        # Ajouter les nouveaux champs
        migrations.AddField(
            model_name='diffusion',
            name='courrier_type',
            field=models.CharField(
                choices=[('entrant', 'Entrant'), ('sortant', 'Sortant')],
                default='entrant',
                max_length=10,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='diffusion',
            name='courrier_id',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='diffusion',
            name='note',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='diffusion',
            name='date_expiration',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='diffusion',
            name='statut',
            field=models.CharField(
                choices=[('en_cours', 'En cours'), ('terminee', 'Terminée')],
                default='en_cours',
                max_length=20,
            ),
        ),
        migrations.AddIndex(
            model_name='diffusion',
            index=models.Index(fields=['courrier_type', 'courrier_id'], name='courriers_diffusion_type_id_idx'),
        ),

        # ─── 4. DiffusionDestinataire: Nouvelle table ───────────────────────────
        migrations.CreateModel(
            name='DiffusionDestinataire',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lu', models.BooleanField(default=False)),
                ('date_lecture', models.DateTimeField(blank=True, null=True)),
                ('diffusion', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='destinataires',
                    to='courriers.diffusion',
                )),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='diffusions_recues',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'unique_together': {('diffusion', 'user')},
            },
        ),
    ]
