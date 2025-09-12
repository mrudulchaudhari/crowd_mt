from rest_framework import permissions

class IsEventManager(permissions.BasePermission):
    """
    Custom permission to only allow managers of an event to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # This permission applies to write operations (PUT, PATCH, DELETE).
        # The `obj` here is the Event instance being accessed.
        # We check if the event's manager is the same as the user making the request.
        return obj.manager == request.user

