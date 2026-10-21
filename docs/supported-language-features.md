# DiffBeacon Supported Language & Framework Features

**Version:** 1.0.0  
**Status:** Approved  
**Date:** October 2026  

---

## 1. Scope and Strategy

DiffBeacon begins with deep, deterministic static support for **Python 3.10+** and the **Django / Django REST Framework (DRF)** ecosystem. 

Rather than pretending to have universal support for all languages with shallow regex matching, DiffBeacon establishes a deep framework-aware adapter pipeline for Python and DRF, with an explicit **Unknowns Register** for what cannot be resolved.

---

## 2. Supported Constructs (Python 3.10+)

| Construct | Extraction Method | Edge / Metadata Generated | Certainty Level |
| :--- | :--- | :--- | :--- |
| **Module Imports** (`import foo`, `from bar import baz`) | `ast.Import`, `ast.ImportFrom` | `imports` edge between modules | `Statically Established` |
| **Class Definitions** | `ast.ClassDef` | Symbol node with inheritance hierarchy | `Statically Established` |
| **Function & Method Definitions** | `ast.FunctionDef`, `ast.AsyncFunctionDef` | Symbol node with parameter list, defaults, and type hints | `Statically Established` |
| **Direct Function Calls** | `ast.Call` where target is a resolved Name/Attribute | `calls` edge between caller and callee | `Statically Established` |
| **Conditional Branches** (`if`, `elif`, `else`) | `ast.If` condition expressions | Validation branch delta detection | `Statically Established` |
| **Exception Handling** (`try`, `except`) | `ast.Try`, `ast.ExceptHandler` | Error handling delta detection | `Statically Established` |
| **Variable Assignments** | `ast.Assign`, `ast.AnnAssign` | Module/Class attribute definitions | `Statically Established` |

---

## 3. Supported Framework Constructs (Django & DRF)

| Framework Construct | Extraction Mechanism | Analysis Delta Detected |
| :--- | :--- | :--- |
| **URL Routing (`urls.py`)** | AST inspection of `urlpatterns`, `path()`, `re_path()`, `DefaultRouter.register()` | Route addition, removal, path parameter change, or view handler target change |
| **DRF Serializers** | Classes inheriting from `serializers.Serializer` or `ModelSerializer` | Field added/removed, `required=True/False`, `allow_null`, `default`, custom `validate_<field>` |
| **Django Models (`models.py`)** | Classes inheriting from `models.Model` | Field definitions (`CharField`, `ForeignKey`, etc.), `null`, `blank`, `default`, constraints |
| **API Views (`views.py`)** | `APIView`, `GenericAPIView`, `ModelViewSet` classes and `@api_view` decorators | HTTP methods supported (`get`, `post`, `patch`, `delete`), permissions, serializers |
| **Authentication & Permissions** | `permission_classes`, `authentication_classes` attributes | Access rule modifications |
| **Django Tests (`test_*.py`)** | Test classes inheriting `APITestCase`, `TestCase` and `def test_*` | Links tests to target endpoints and serializers |

---

## 4. Intentionally Unresolved Constructs (The Unknowns)

DiffBeacon explicitly recognizes constructs that **cannot** be reliably determined purely by static AST traversal. These are logged in the **Unknowns Register**:

1. **Dynamic Attribute Dispatch:** `getattr(obj, dynamic_var)`, `setattr()`.
2. **Dynamic Evaluation:** `eval()`, `exec()`, `importlib.import_module()`.
3. **Variable Keyword Arguments:** Unbounded `**kwargs` forwarding where destination keys cannot be determined from call sites.
4. **Complex Metaclass Metaprogramming:** Custom metaclass code that generates attributes at runtime without static declarations.
5. **Database State Dependencies:** Inferences relying on runtime database rows (e.g., verifying if a default foreign key ID 1 exists in the database).
6. **Network & External Services:** External gRPC/REST APIs called via `requests` or `httpx` whose response schemas cannot be statically inspected.
