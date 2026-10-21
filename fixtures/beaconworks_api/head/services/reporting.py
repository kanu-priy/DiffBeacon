from .utils import legacy_format_ssn
from ..models import Employee


def generate_compliance_report(employee: Employee, raw_tax_id: str) -> dict:
    """
    Generates payroll compliance audit payload.
    BROKEN REFERENCE IN HEAD:
    Depends on legacy_format_ssn which was deleted in head utils.py!
    """
    formatted_ssn = legacy_format_ssn(raw_tax_id)
    return {
        "employee_id": employee.id,
        "name": f"{employee.first_name} {employee.last_name}",
        "masked_tax_identifier": formatted_ssn,
        "department": employee.department.code,
    }
