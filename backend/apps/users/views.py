from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model

from .models import Role, Permission
from .serializers import (
    UserSerializer, UserCreateUpdateSerializer, 
    RoleSerializer, PermissionSerializer
)
from .services import activate_user, assign_role, create_role_permission

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """Only admins/staff can list all users or delete. Regular users access own profile via /profile/."""
        if self.action in ['list', 'create', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'service', 'role', 'is_active']
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['date_joined', 'first_name']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserSerializer

    @action(detail=True, methods=['patch'])
    def activate(self, request, pk=None):
        """Activer/Désactiver un utilisateur"""
        user = self.get_object()
        is_active = request.data.get('is_active', not user.is_active)
        activate_user(user, active=bool(is_active), actor=request.user)
        return Response({'status': 'success', 'is_active': user.is_active})

    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        """Profil de l'utilisateur connecté"""
        user = request.user
        if request.method == 'GET':
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data)
        
        serializer = UserCreateUpdateSerializer(user, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()
        return Response(UserSerializer(user, context={'request': request}).data)

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def avatar(self, request):
        """Uploader l'avatar du profil"""
        user = request.user
        if 'avatar' not in request.FILES:
            return Response({"detail": "Aucun fichier fourni."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.avatar = request.FILES['avatar']
        user.save()
        return Response({"detail": "Avatar mis à jour.", "avatar_url": request.build_absolute_uri(user.avatar.url)})


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        role = self.get_object()
        if role.is_system:
            return Response({"detail": "Vous ne pouvez pas supprimer un rôle système."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get', 'put'])
    def permissions(self, request, pk=None):
        role = self.get_object()
        
        if request.method == 'GET':
            permissions = Permission.objects.filter(role=role)
            serializer = PermissionSerializer(permissions, many=True)
            return Response(serializer.data)
            
        elif request.method == 'PUT':
            # Mise à jour en bloc des permissions
            data = request.data
            result = []
            for item in data:
                resource = item.get('resource')
                perm, created = Permission.objects.get_or_create(role=role, resource=resource)
                
                # Update specific fields
                perm = create_role_permission(
                    role,
                    resource,
                    can_create=item.get('can_create', perm.can_create),
                    can_read=item.get('can_read', perm.can_read),
                    can_update=item.get('can_update', perm.can_update),
                    can_delete=item.get('can_delete', perm.can_delete),
                    can_download=item.get('can_download', perm.can_download),
                    can_share=item.get('can_share', perm.can_share),
                    can_approve=item.get('can_approve', perm.can_approve),
                )
                result.append(perm)
                
            return Response(PermissionSerializer(result, many=True).data)
