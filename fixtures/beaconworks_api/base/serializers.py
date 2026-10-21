from rest_framework import serializers
from .models import Department, Employee


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ("id", "name", "code", "is_active", "budget")


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Employee
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "department",
            "department_name",
            "employment_status",
            "annual_salary",
            "hire_date",
        )


class EmployeeCreateSerializer(serializers.ModelSerializer):
    # In base v1.0: department_id is STRICTLY REQUIRED
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        required=True,
        allow_null=False,
    )

    class Meta:
        model = Employee
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "department_id",
            "annual_salary",
        )

    def validate_annual_salary(self, value):
        if value < 30000:
            raise serializers.ValidationError("Annual salary cannot be below baseline minimum $30,000.")
        return value
