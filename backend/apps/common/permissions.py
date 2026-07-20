from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwner(BasePermission):
	def has_object_permission(self, request, view, obj):
		owner = getattr(obj, 'created_by', None) or getattr(obj, 'user', None)
		return owner == request.user


class IsAdminOrReadOnly(BasePermission):
	def has_permission(self, request, view):
		if request.method in SAFE_METHODS:
			return True
		return bool(request.user and request.user.is_staff)


class HasModulePermission(BasePermission):
	module_name = None

	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False

		if request.user.is_superuser or request.user.is_staff:
			return True

		module_name = self.module_name or getattr(view, 'module_name', None)
		if not module_name:
			return True

		role = getattr(request.user, 'role', None)
		if not role:
			return False

		action_map = {
			'GET': 'can_read',
			'HEAD': 'can_read',
			'OPTIONS': 'can_read',
			'POST': 'can_create',
			'PUT': 'can_update',
			'PATCH': 'can_update',
			'DELETE': 'can_delete',
		}
		required_flag = action_map.get(request.method, 'can_read')
		return role.permissions.filter(resource=module_name, **{required_flag: True}).exists()
