from django.contrib import admin
from .models import Event, HeadcountSnapshot

class HeadcountSnapshotInline(admin.TabularInline):
    """
    Allows viewing snapshots directly within the Event detail page.
    This is set to be mostly read-only to prevent accidental data alteration.
    """
    model = HeadcountSnapshot
    extra = 0  # Don't show any extra forms for adding new snapshots by default
    readonly_fields = ('headcount', 'source', 'timestamp')
    can_delete = False
    ordering = ('-timestamp',) # Show the latest snapshots first

    def has_add_permission(self, request, obj=None):
        # Prevent adding new snapshots from the inline view
        return False


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """
    Custom admin configuration for the Event model.
    """
    list_display = ('name', 'date', 'get_current_headcount', 'get_status')
    list_filter = ('date',)
    search_fields = ('name',)
    inlines = [HeadcountSnapshotInline]

    def get_current_headcount(self, obj):
        """
        Calculates and displays the latest headcount in the admin list view.
        """
        latest_snapshot = obj.headcountsnapshot_set.order_by("-timestamp").first()
        return latest_snapshot.headcount if latest_snapshot else 0
    get_current_headcount.short_description = 'Current Headcount' # Column header

    def get_status(self, obj):
        """
        Determines and displays the crowd status (Green/Yellow/Red) in the list view.
        """
        headcount = self.get_current_headcount(obj)
        if headcount < obj.safe_threshold:
            return "Green"
        elif headcount > obj.crowded_threshold:
            return "Red"
        return "Yellow"
    get_status.short_description = 'Status' # Column header


@admin.register(HeadcountSnapshot)
class HeadcountSnapshotAdmin(admin.ModelAdmin):
    """
    Admin configuration for viewing headcount history.
    """
    list_display = ('event', 'headcount', 'source', 'timestamp')
    list_filter = ('event', 'source', 'timestamp')
    search_fields = ('event__name',)
    date_hierarchy = 'timestamp' # Adds handy date-based navigation
    ordering = ('-timestamp',)