from apps.code_index.parser import PythonASTParser


def test_parser_extracts_classes_functions_and_calls():
    parser = PythonASTParser()
    code = """
import math
from decimal import Decimal

class PayrollCalculator:
    def __init__(self, multiplier: float = 1.0):
        self.multiplier = multiplier

    def compute(self, base_salary: Decimal) -> Decimal:
        tax = self.calculate_tax(base_salary)
        return (base_salary - tax) * Decimal(str(self.multiplier))

    def calculate_tax(self, amount: Decimal) -> Decimal:
        return amount * Decimal("0.20")
"""
    symbols, imports, unknowns = parser.parse_source(code, "services/calc.py")
    qnames = [s.qualified_name for s in symbols]

    assert "services.calc" in qnames
    assert "services.calc.PayrollCalculator" in qnames
    assert "services.calc.PayrollCalculator.compute" in qnames
    assert "services.calc.PayrollCalculator.calculate_tax" in qnames

    # Check calls in compute method
    compute_sym = next(s for s in symbols if s.name == "compute")
    call_targets = [c.target_name for c in compute_sym.calls]
    assert any("calculate_tax" in ct for ct in call_targets)


def test_parser_detects_dynamic_dispatch():
    parser = PythonASTParser()
    code = """
def dispatch(channel, *args):
    handler = getattr(dispatcher, f"send_{channel}")
    return handler(*args)
"""
    symbols, imports, unknowns = parser.parse_source(code, "services/notify.py")
    assert len(unknowns) >= 1
    assert unknowns[0]["reason"] == "dynamic_dispatch"
    assert "getattr" in unknowns[0]["code_snippet"]
