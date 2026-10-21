from decimal import Decimal
from ..models import Employee


def validate_compensation(salary: Decimal) -> bool:
    """
    Head v1.1 Compensation validation.
    Updated minimum threshold raised from $30,000 to $45,000.
    """
    if salary < Decimal("45000.00"):
        raise ValueError("Salary must meet updated minimum threshold of $45,000.")
    return True


def calculate_tax_deduction(gross_amount: Decimal) -> Decimal:
    """
    Head v1.1 Tax calculation.
    Updated deduction rate raised from 15% to 20%.
    """
    rate = Decimal("0.20")
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
