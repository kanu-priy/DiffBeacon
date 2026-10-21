from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Department, Employee
from .serializers import (
    DepartmentSerializer,
    EmployeeSerializer,
    EmployeeCreateSerializer,
)
from .services.employee import enroll_employee
from .services.notifications import dispatch_notification


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("department").all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return EmployeeCreateSerializer
        return EmployeeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # In head v1.1, enroll_employee handles optional department logic
        employee = enroll_employee(serializer.validated_data)
        
        # Notify via dynamic channel dispatcher
        dispatch_notification("email", employee_id=employee.id, message="Welcome to BeaconWorks")

        output_serializer = EmployeeSerializer(employee)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
