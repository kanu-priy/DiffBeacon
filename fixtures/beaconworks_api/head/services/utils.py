def generate_employee_badge_code(department_code: str, employee_id: int) -> str:
    """
    Standard badge identifier generator.
    """
    return f"BW-{department_code.upper()}-{employee_id:05d}"


def format_employee_identifier(employee_id: int, prefix: str = "EMP") -> str:
    """
    New identifier formatter introduced in v1.1.
    NOTE: legacy_format_ssn was removed from this file, leaving broken references!
    """
    return f"{prefix}-{employee_id:06d}"
