from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    is_active = models.BooleanField(default=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    class Meta:
        db_table = "beacon_departments"

    def __str__(self):
        return f"{self.code} - {self.name}"


class Employee(models.Model):
    STATUS_CHOICES = (
        ("probation", "Probationary"),
        ("active", "Active Regular"),
        ("terminated", "Terminated"),
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="employees",
    )
    # In base v1.0, default status is 'probation'
    employment_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="probation",
    )
    hire_date = models.DateField(auto_now_add=True)
    annual_salary = models.DecimalField(max_digits=10, decimal_places=2, default=50000.00)

    class Meta:
        db_table = "beacon_employees"

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class AuditLog(models.Model):
    action = models.CharField(max_length=255)
    entity_id = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        db_table = "beacon_audit_logs"
