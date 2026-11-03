import re
from typing import Any, Dict, List, Optional


class ClientConsumerParser:
    """
    Statically inspects TypeScript / JavaScript files for frontend API consumers:
    - window.fetch()
    - axios.get / post / put / delete / patch
    - api.get / post / put / delete
    - TanStack useQuery / useMutation endpoints
    """

    # Matches fetch('/api/...'), axios.get('/api/...'), api.post('/api/...')
    CALL_PATTERNS = [
        # fetch("/api/v1/...")
        re.compile(r'fetch\s*\(\s*[\'"`]([^\'"`]+)[\'"`]', re.IGNORECASE),
        # axios.get("...") or axios.post("...")
        re.compile(r'axios\s*\.\s*(get|post|put|patch|delete)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]', re.IGNORECASE),
        # api.get("...") or api.post("...")
        re.compile(r'\bapi\s*\.\s*(get|post|put|patch|delete)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]', re.IGNORECASE),
        # queryFn: () => api.get("...") or queryKey: ["/api/..."]
        re.compile(r'queryKey\s*:\s*\[\s*[\'"`]([^\'"`]+)[\'"`]', re.IGNORECASE),
    ]

    @classmethod
    def extract_client_api_calls(cls, file_path: str, content: str) -> List[Dict[str, Any]]:
        calls = []
        lines = content.splitlines()

        for line_idx, line in enumerate(lines, start=1):
            for pattern in cls.CALL_PATTERNS:
                matches = pattern.finditer(line)
                for match in matches:
                    groups = match.groups()
                    if len(groups) == 1:
                        endpoint = groups[0]
                        method = "GET"
                    else:
                        method = groups[0].upper()
                        endpoint = groups[1]

                    # Filter out non-api strings
                    if endpoint.startswith("/") or "api" in endpoint.lower():
                        calls.append({
                            "file_path": file_path,
                            "line_number": line_idx,
                            "endpoint": endpoint,
                            "method": method,
                            "line_text": line.strip()[:200],
                        })
        return calls

    @classmethod
    def match_client_calls_to_routes(
        cls,
        client_calls: List[Dict[str, Any]],
        drf_routes: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Correlates client API endpoint calls with backend DRF routes.
        Returns a list of matched consumed_by_client relationships.
        """
        matches = []

        for call in client_calls:
            call_path = call["endpoint"].strip().strip("/")
            # Normalize e.g. /api/v1/employees/ -> employees
            normalized_call = call_path
            for prefix in ("api/v1/", "api/"):
                if normalized_call.startswith(prefix):
                    normalized_call = normalized_call[len(prefix):]

            for route in drf_routes:
                route_pattern = route.get("pattern", "").strip().strip("/").strip("^").strip("$")
                if not route_pattern:
                    continue

                normalized_route = route_pattern
                for prefix in ("api/v1/", "api/"):
                    if normalized_route.startswith(prefix):
                        normalized_route = normalized_route[len(prefix):]

                # Exact or prefix match (e.g. employees == employees or employees/detail == employees)
                if normalized_call == normalized_route or normalized_call.startswith(normalized_route) or normalized_route.startswith(normalized_call):
                    matches.append({
                        "route": route,
                        "client_file": call["file_path"],
                        "client_line": call["line_number"],
                        "client_method": call["method"],
                        "client_endpoint": call["endpoint"],
                        "view_symbol": route.get("view_name") or route.get("callback", "UnknownView"),
                    })

        return matches
