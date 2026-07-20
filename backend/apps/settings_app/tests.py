from django.test import TestCase

from apps.audit.models import AuditLog
from apps.settings_app.models import AppSettings, BackupRecord
from apps.settings_app.services import trigger_backup, get_storage_details


class SettingsSignalTests(TestCase):
	def test_settings_and_backup_emit_audit_logs(self):
		settings_obj = AppSettings.get_settings()
		settings_obj.app_name = 'AgrOdiv GED'
		settings_obj.save()

		backup = trigger_backup(filename='backup.zip', size=1024)
		storage = get_storage_details()

		self.assertTrue(AuditLog.objects.filter(resource_type='settings', resource_name='AppSettings').exists())
		self.assertTrue(AuditLog.objects.filter(resource_type='settings', resource_id=backup.pk, resource_name='backup.zip').exists())
		self.assertGreaterEqual(storage['backups_total_size'], 1024)
