from decimal import Decimal
from ..models import Employee


def validate_compensation(salary: Decimal) -> bool:
    """
    Base v1.0 Compensation validation.
    Enforces minimum $30,000.
    """
    if salary < Decimal("30000.00"):
        raise ValueError("Salary must meet minimum threshold of $30,000.")
    return True


def calculate_tax_deduction(gross_amount: Decimal) -> Decimal:
    """
    Base v1.0 Tax calculation.
    Applies flat 15% deduction rate.
    """
    rate = Decimal("0.15")
    return (gross_amount * rate).quantize(Decimal("0.01"))


def process_payroll(employee: Employee, gross_amount: Decimal) -> dict:
    """
    Calculates net payout after deductions and records payroll event.
    """
    validate_compensation(gross_amount)
    tax_deduction = calculate_tax_deduction(gross_amount)
    net_payout = gross_amount - tax_deduction

    return {
        "employee_id": employee.id,
        "gross_amount": str(gross_amount),
        "tax_deduction": str(tax_deduction),
        "net_payout": str(net_payout),
        "currency": "USD",
    }
