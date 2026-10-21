from decimal import Decimal
from rest_framework.test import APITestCase
from rest_framework import status
from ..models import Department, Employee


class EmployeeAPITests(APITestCase):
    def setUp(self):
        self.dept = Department.objects.create(
            id=1, name="General Administration", code="GEN", budget=1000000.00
        )

    def test_create_employee_success_with_department(self):
        payload = {
            "first_name": "Alan",
            "last_name": "Turing",
            "email": "alan.turing@example.com",
            "department_id": self.dept.id,
            "annual_salary": "75000.00",
        }
        response = self.client.post("/employees/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["first_name"], "Alan")
        self.assertEqual(response.data["department"], self.dept.id)

    def test_create_employee_succeeds_when_department_omitted(self):
        """
        IN HEAD v1.1: omitting department_id now succeeds and resolves default department!
        """
        payload = {
            "first_name": "Ada",
            "last_name": "Lovelace",
            "email": "ada.lovelace@example.com",
            "annual_salary": "85000.00",
        }
        response = self.client.post("/employees/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["department"], self.dept.id)
