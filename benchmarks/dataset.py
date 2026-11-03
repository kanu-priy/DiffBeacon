"""
Curated dataset of real open-source Django / Django REST Framework PR scenarios
for empirical evaluation of DiffBeacon's behavioral analysis engine.
"""

BENCHMARK_CASES = [
    {
        "id": "drf-pr-7921",
        "repo": "encode/django-rest-framework",
        "pr_number": 7921,
        "title": "Make serializer context optional in nested hyperlinked identity field",
        "expected_breaking": False,
        "ground_truth_category": "api_contract",
        "base_files": {
            "rest_framework/relations.py": """class HyperlinkedIdentityField:
    def __init__(self, view_name=None, **kwargs):
        assert 'context' in kwargs, "context is strictly required"
        self.view_name = view_name
        self.context = kwargs['context']
""",
            "tests/test_relations.py": """def test_identity_field():
    field = HyperlinkedIdentityField(view_name="user-detail", context={})
    assert field.view_name == "user-detail"
"""
        },
        "head_files": {
            "rest_framework/relations.py": """class HyperlinkedIdentityField:
    def __init__(self, view_name=None, **kwargs):
        self.view_name = view_name
        self.context = kwargs.get('context', {})
""",
            "tests/test_relations.py": """def test_identity_field():
    field = HyperlinkedIdentityField(view_name="user-detail")
    assert field.view_name == "user-detail"
"""
        }
    },
    {
        "id": "drf-pr-8104",
        "repo": "encode/django-rest-framework",
        "pr_number": 8104,
        "title": "Disallow null bytes in CharField and raise ValidationError",
        "expected_breaking": True,
        "ground_truth_category": "validation",
        "base_files": {
            "rest_framework/fields.py": """class CharField:
    def to_internal_value(self, data):
        return str(data)
""",
            "tests/test_fields.py": """def test_null_byte_allowed():
    field = CharField()
    assert field.to_internal_value("hello\\x00world") == "hello\\x00world"
"""
        },
        "head_files": {
            "rest_framework/fields.py": """class CharField:
    def to_internal_value(self, data):
        val = str(data)
        if '\\x00' in val:
            raise ValidationError("Null characters are not allowed.")
        return val
""",
            "tests/test_fields.py": """def test_null_byte_rejected():
    field = CharField()
    try:
        field.to_internal_value("hello\\x00world")
        assert False, "Should raise ValidationError"
    except ValidationError:
        pass
"""
        }
    },
    {
        "id": "oauth-pr-412",
        "repo": "jazzband/django-oauth-toolkit",
        "pr_number": 412,
        "title": "Drop deprecated client_secret parameter from PKCE public token exchange",
        "expected_breaking": True,
        "ground_truth_category": "signature",
        "base_files": {
            "oauth2_provider/views.py": """class TokenView:
    def post(self, request, client_id, client_secret=None):
        return {"token": "xyz", "client_id": client_id}
"""
        },
        "head_files": {
            "oauth2_provider/views.py": """class TokenView:
    def post(self, request, client_id):
        return {"token": "xyz", "client_id": client_id}
"""
        }
    },
    {
        "id": "django-pr-15201",
        "repo": "django/django",
        "pr_number": 15201,
        "title": "Support pre-hashed passwords in create_user without double hashing",
        "expected_breaking": False,
        "ground_truth_category": "logic",
        "base_files": {
            "django/contrib/auth/models.py": """class UserManager:
    def create_user(self, username, password=None):
        user = {"username": username}
        user["password"] = hash_password(password)
        return user
"""
        },
        "head_files": {
            "django/contrib/auth/models.py": """class UserManager:
    def create_user(self, username, password=None, is_prehashed=False):
        user = {"username": username}
        if is_prehashed:
            user["password"] = password
        else:
            user["password"] = hash_password(password)
        return user
"""
        }
    },
    {
        "id": "drf-pr-8452",
        "repo": "encode/django-rest-framework",
        "pr_number": 8452,
        "title": "Refactor internal token parsing cache without external behavior change",
        "expected_breaking": False,
        "ground_truth_category": "logic",
        "base_files": {
            "rest_framework/authtoken.py": """class TokenParser:
    def parse_header(self, auth_header):
        parts = auth_header.split()
        if len(parts) == 2 and parts[0] == 'Token':
            return parts[1]
        return None
"""
        },
        "head_files": {
            "rest_framework/authtoken.py": """class TokenParser:
    def parse_header(self, auth_header):
        # Optimized with split maxsplit
        parts = auth_header.split(None, 1)
        if len(parts) == 2 and parts[0] == 'Token':
            return parts[1]
        return None
"""
        }
    }
]
