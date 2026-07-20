"""Migration v2.1 for dossiers app: add is_deleted and deleted_at fields."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dossiers', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='dossier',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='dossier',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name='dossier',
            index=models.Index(fields=['is_deleted'], name='dossiers_dossier_is_deleted_idx'),
        ),
    ]
