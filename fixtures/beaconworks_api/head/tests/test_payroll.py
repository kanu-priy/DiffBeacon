from decimal import Decimal
import unittest
from ..services.payroll import validate_compensation, calculate_tax_deduction


class PayrollUnitTests(unittest.TestCase):
    def test_minimum_salary_threshold_head(self):
        # In head v1.1, minimum is $45,000
        self.assertTrue(validate_compensation(Decimal("45000.00")))
        with self.assertRaises(ValueError):
            validate_compensation(Decimal("44999.00"))

    def test_tax_deduction_head_rate(self):
        # In head v1.1, rate is 20%
        gross = Decimal("1000.00")
        deduction = calculate_tax_deduction(gross)
        self.assertEqual(deduction, Decimal("200.00"))
