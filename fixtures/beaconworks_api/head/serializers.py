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
    # IN HEAD v1.1: department_id is OPTIONAL (required=False, allow_null=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        required=False,
        allow_null=True,
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
        # IN HEAD v1.1: minimum annual salary threshold raised to $45,000
        if value < 45000:
            raise serializers.ValidationError("Annual salary cannot be below updated baseline minimum $45,000.")
        return value
