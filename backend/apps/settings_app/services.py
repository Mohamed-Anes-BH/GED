import os
import subprocess
import zipfile
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.utils import timezone
from django.db.models import Sum

from .models import AppSettings, BackupRecord

MEDIA_ROOT = getattr(settings, 'MEDIA_ROOT', '/app/media')
BACKUP_DIR = os.path.join(MEDIA_ROOT, 'backups')


def get_settings():
    return AppSettings.get_settings()


def update_settings(data):
    settings_obj = AppSettings.get_settings()
    for field, value in data.items():
        if hasattr(settings_obj, field):
            setattr(settings_obj, field, value)
    settings_obj.save()
    return settings_obj


def get_about_info():
    settings_obj = AppSettings.get_settings()
    return {
        'app_name': settings_obj.app_name,
        'language': settings_obj.language,
        'timezone': settings_obj.timezone,
        'primary_color': settings_obj.primary_color,
    }


def get_storage_details():
    settings_obj = AppSettings.get_settings()
    backups_total = BackupRecord.objects.aggregate(total_size=Sum('size')).get('total_size') or 0
    return {
        'storage_limit': settings_obj.storage_limit,
        'max_upload_size': settings_obj.max_upload_size,
        'backups_total_size': backups_total,
        'updated_at': settings_obj.updated_at,
    }


def create_backup_record(filename, size, backup_type='manual', status='completed', file_path=''):
    return BackupRecord.objects.create(
        filename=filename,
        size=size,
        type=backup_type,
        status=status,
    )


def trigger_backup(backup_type='manual'):
    """
    Performs a real backup:
    1. Zips the MEDIA_ROOT/documents folder.
    2. Optionally dumps the PostgreSQL database using pg_dump.
    3. Saves the backup file and registers a BackupRecord.
    """
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    zip_filename = f'backup_{backup_type}_{timestamp}.zip'
    zip_path = os.path.join(BACKUP_DIR, zip_filename)

    total_size = 0
    errors = []

    # --- Step 1: Zip media documents ---
    docs_dir = os.path.join(MEDIA_ROOT, 'documents')
    if os.path.isdir(docs_dir):
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(docs_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, MEDIA_ROOT)
                    zf.write(file_path, arcname)
        total_size = os.path.getsize(zip_path)
    else:
        # create an empty placeholder zip if no documents yet
        with zipfile.ZipFile(zip_path, 'w') as zf:
            zf.writestr('README.txt', f'AgrOdiv GED Backup created at {timestamp}\nNo documents found.')
        total_size = os.path.getsize(zip_path)

    # --- Step 2: Try pg_dump if DATABASE_URL is set ---
    db_url = os.environ.get('DATABASE_URL', '')
    if db_url and 'postgres' in db_url:
        sql_filename = f'backup_{backup_type}_{timestamp}.sql'
        sql_path = os.path.join(BACKUP_DIR, sql_filename)
        try:
            result = subprocess.run(
                ['pg_dump', db_url, '-f', sql_path],
                capture_output=True,
                text=True,
                timeout=120,
            )
            if result.returncode == 0 and os.path.exists(sql_path):
                # Append to the zip
                with zipfile.ZipFile(zip_path, 'a', zipfile.ZIP_DEFLATED) as zf:
                    zf.write(sql_path, sql_filename)
                os.remove(sql_path)
                total_size = os.path.getsize(zip_path)
        except Exception as e:
            errors.append(f'pg_dump error: {e}')

    record = create_backup_record(
        filename=zip_filename,
        size=total_size,
        backup_type=backup_type,
        status='completed' if not errors else 'partial',
    )
    return record


def list_backups():
    return BackupRecord.objects.all().order_by('-created_at')


def restore_backup(backup_record):
    """
    Restores media files from the backup zip archive.
    """
    zip_path = os.path.join(BACKUP_DIR, backup_record.filename)
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"Backup file not found: {zip_path}")

    with zipfile.ZipFile(zip_path, 'r') as zf:
        # Only extract non-SQL files (media files)
        for member in zf.namelist():
            if not member.endswith('.sql') and not member == 'README.txt':
                zf.extract(member, MEDIA_ROOT)

    backup_record.status = 'restored'
    backup_record.save(update_fields=['status'])
    return backup_record
