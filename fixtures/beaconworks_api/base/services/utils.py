def legacy_format_ssn(raw_ssn: str) -> str:
    """
    Deprecated utility to format tax ID numbers.
    Present in Base v1.0. Removed in Head v1.1.
    """
    clean = "".join(filter(str.isdigit, raw_ssn))
    if len(clean) == 9:
        return f"{clean[:3]}-{clean[3:5]}-{clean[5:]}"
    return "***-**-****"


def generate_employee_badge_code(department_code: str, employee_id: int) -> str:
    """
    Standard badge identifier generator.
    """
    return f"BW-{department_code.upper()}-{employee_id:05d}"
