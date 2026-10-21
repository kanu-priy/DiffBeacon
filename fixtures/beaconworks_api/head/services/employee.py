from ..models import Employee, Department, AuditLog


def assign_default_department() -> Department:
    """
    HEAD v1.1 Fallback Department Resolution.
    RUNTIME UNCERTAINTY:
    Assumes a fallback department with pk=1 exists in the database.
    If database lacks seed row, this raises Department.DoesNotExist at runtime.
    """
    try:
        return Department.objects.get(pk=1)
    except Department.DoesNotExist:
        # Fallback to first available active department
        first_dept = Department.objects.filter(is_active=True).first()
        if not first_dept:
            raise RuntimeError("Database missing default fallback department row.")
        return first_dept


def enroll_employee(validated_data: dict) -> Employee:
    """
    Head v1.1 Enrollment logic.
    Handles optional department: assigns fallback default if omitted.
    """
    department = validated_data.get("department")
    if not department:
        department = assign_default_department()

    employee = Employee.objects.create(
        first_name=validated_data["first_name"],
        last_name=validated_data["last_name"],
        email=validated_data["email"],
        department=department,
        annual_salary=validated_data.get("annual_salary", 50000.00),
    )

    AuditLog.objects.create(
        action="EMPLOYEE_ENROLLED",
        entity_id=employee.id,
        metadata={"email": employee.email, "department_id": employee.department_id, "default_assigned": validated_data.get("department") is None},
    )

    return employee
