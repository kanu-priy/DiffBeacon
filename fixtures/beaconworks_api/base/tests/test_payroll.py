from decimal import Decimal
import unittest
from ..services.payroll import validate_compensation, calculate_tax_deduction


class PayrollUnitTests(unittest.TestCase):
    def test_minimum_salary_threshold_base(self):
        # In base v1.0, 30,000 passes
        self.assertTrue(validate_compensation(Decimal("30000.00")))
        with self.assertRaises(ValueError):
            validate_compensation(Decimal("29999.00"))

    def test_tax_deduction_base_rate(self):
        # Base v1.0 uses 15% rate
        gross = Decimal("1000.00")
        deduction = calculate_tax_deduction(gross)
        self.assertEqual(deduction, Decimal("150.00"))
