import ast
from apps.contracts.django_adapter import DjangoContractAdapter
from apps.contracts.comparator import ContractComparator


def test_serializer_contract_extraction():
    code = """
from rest_framework import serializers
from .models import Department, Employee

class EmployeeCreateSerializer(serializers.ModelSerializer):
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=True,
        allow_null=False,
    )

    class Meta:
        model = Employee
        fields = ('id', 'first_name', 'department_id')

    def validate_department_id(self, value):
        return value
"""
    tree = ast.parse(code)
    adapter = DjangoContractAdapter()
    contracts = adapter.extract_serializer_contracts(tree, "api/serializers.py")

    assert len(contracts) == 1
    c = contracts[0]
    assert c["class_name"] == "EmployeeCreateSerializer"
    assert "department_id" in c["fields"]
    assert c["fields"]["department_id"]["required"] is True
    assert len(c["validations"]) == 1


def test_serializer_comparator_detects_optional_shift():
    base_code = """
class EmpSerializer(serializers.ModelSerializer):
    dept_id = serializers.PrimaryKeyRelatedField(required=True)
"""
    head_code = """
class EmpSerializer(serializers.ModelSerializer):
    dept_id = serializers.PrimaryKeyRelatedField(required=False, allow_null=True)
"""
    adapter = DjangoContractAdapter()
    base_c = adapter.extract_serializer_contracts(ast.parse(base_code), "serializers.py")
    head_c = adapter.extract_serializer_contracts(ast.parse(head_code), "serializers.py")

    comparator = ContractComparator()
    c_deltas, b_deltas = comparator.compare_serializers(base_c, head_c)

    assert len(c_deltas) == 1
    assert c_deltas[0]["change_nature"] == "modified_optional"
    assert c_deltas[0]["is_breaking"] is False
    assert len(b_deltas) == 1
    assert b_deltas[0]["category"] == "api_contract"


def test_serializer_comparator_detects_required_and_removed_field_changes():
    base_code = """
class EmpSerializer(serializers.ModelSerializer):
    dept_id = serializers.CharField(required=False)
    legacy_code = serializers.CharField(required=True)
"""
    head_code = """
class EmpSerializer(serializers.ModelSerializer):
    dept_id = serializers.CharField(required=True)
    new_field = serializers.CharField(required=True)
"""
    adapter = DjangoContractAdapter()
    base_c = adapter.extract_serializer_contracts(ast.parse(base_code), "serializers.py")
    head_c = adapter.extract_serializer_contracts(ast.parse(head_code), "serializers.py")

    comparator = ContractComparator()
    c_deltas, b_deltas = comparator.compare_serializers(base_c, head_c)

    change_natures = {delta["change_nature"] for delta in c_deltas}
    assert "modified_required" in change_natures
    assert "removed" in change_natures
    assert any(delta["category"] == "api_contract" for delta in b_deltas)
