from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role, Permission

User = get_user_model()

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    role_details = RoleSerializer(source='role', read_only=True)
    
    # We will expand department and service details once organization app is built.
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'avatar', 'phone', 
            'role', 'role_details', 'department', 'service', 
            'is_active', 'is_staff', 'is_superuser', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined', 'is_staff', 'is_superuser']

class UserCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'email', 'password', 'first_name', 'last_name', 'phone', 
            'role', 'department', 'service', 'is_active'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
