from ..models import Employee, AuditLog


def enroll_employee(validated_data: dict) -> Employee:
    """
    Base v1.0 Enrollment logic.
    Assumes department instance is strictly provided by serializer validation.
    """
    employee = Employee.objects.create(
        first_name=validated_data["first_name"],
        last_name=validated_data["last_name"],
        email=validated_data["email"],
        department=validated_data["department"],
        annual_salary=validated_data.get("annual_salary", 50000.00),
    )

    AuditLog.objects.create(
        action="EMPLOYEE_ENROLLED",
        entity_id=employee.id,
        metadata={"email": employee.email, "department_id": employee.department_id},
    )

    return employee
