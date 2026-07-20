"""Migration v2.1 for documents app: add confidentialite field."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0003_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='confidentialite',
            field=models.CharField(
                choices=[
                    ('public', 'Public'),
                    ('interne', 'Interne'),
                    ('confidentiel', 'Confidentiel'),
                    ('secret', 'Secret'),
                ],
                default='interne',
                max_length=20,
            ),
        ),
    ]
