from decimal import Decimal
from rest_framework.test import APITestCase
from rest_framework import status
from ..models import Department, Employee


class EmployeeAPITests(APITestCase):
    def setUp(self):
        self.dept = Department.objects.create(
            name="Engineering", code="ENG", budget=1000000.00
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

    def test_create_employee_fails_when_department_missing(self):
        """
        In Base v1.0, omitting department_id fails validation with 400 Bad Request.
        """
        payload = {
            "first_name": "Ada",
            "last_name": "Lovelace",
            "email": "ada.lovelace@example.com",
            "annual_salary": "85000.00",
        }
        response = self.client.post("/employees/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("department_id", response.data)
