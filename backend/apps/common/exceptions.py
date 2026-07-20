from rest_framework.exceptions import APIException, NotFound, PermissionDenied


class CustomValidationError(APIException):
	status_code = 400
	default_detail = 'Une erreur de validation est survenue.'
	default_code = 'validation_error'


class ResourceNotFoundError(NotFound):
	default_detail = 'La ressource demandée est introuvable.'


class PermissionDeniedError(PermissionDenied):
	default_detail = 'Vous n’avez pas la permission d’effectuer cette action.'
