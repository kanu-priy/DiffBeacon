from collections import defaultdict
from typing import Any, Dict, List, Optional, Set, Tuple


class DependencyGraph:
    """
    In-memory representation of a snapshot's typed dependency graph.
    """

    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.adjacency: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.reverse_adjacency: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

    def add_node(
        self,
        node_id: str,
        label: str,
        node_type: str,
        file_path: str,
        line_number: int,
        is_changed: bool = False,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.nodes[node_id] = {
            "id": node_id,
            "label": label,
            "type": node_type,
            "file_path": file_path,
            "line_number": line_number,
            "is_changed": is_changed,
            "metadata": metadata or {},
        }

    def add_edge(
        self,
        source: str,
        target: str,
        edge_type: str,
        provenance: str = "ast_static",
        certainty: str = "definite",
        file_path: str = "",
        line_number: int = 0,
    ):
        edge_data = {
            "source": source,
            "target": target,
            "type": edge_type,
            "provenance": provenance,
            "certainty": certainty,
            "file_path": file_path,
            "line_number": line_number,
        }
        self.adjacency[source].append(edge_data)
        self.reverse_adjacency[target].append(edge_data)

    def get_blast_radius(
        self, root_node_ids: List[str], max_radius: int = 3
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Performs bounded BFS traversal discovering all nodes and edges
        connected to changed symbols within max_radius hops.
        Includes upstream callers/routes and downstream callees/models.
        """
        visited_nodes: Set[str] = set()
        collected_edges: List[Dict[str, Any]] = []
        edge_keys: Set[Tuple[str, str, str]] = set()

        queue: List[Tuple[str, int]] = [(nid, 0) for nid in root_node_ids if nid in self.nodes]
        for nid in root_node_ids:
            if nid in self.nodes:
                visited_nodes.add(nid)

        while queue:
            curr_id, depth = queue.pop(0)
            if depth >= max_radius:
                continue

            # Forward edges (downstream dependencies)
            for edge in self.adjacency.get(curr_id, []):
                tgt = edge["target"]
                ekey = (edge["source"], edge["target"], edge["type"])
                if ekey not in edge_keys:
                    edge_keys.add(ekey)
                    collected_edges.append(edge)

                if tgt not in visited_nodes and tgt in self.nodes:
                    visited_nodes.add(tgt)
                    queue.append((tgt, depth + 1))

            # Reverse edges (upstream callers / consumers)
            for edge in self.reverse_adjacency.get(curr_id, []):
                src = edge["source"]
                ekey = (edge["source"], edge["target"], edge["type"])
                if ekey not in edge_keys:
                    edge_keys.add(ekey)
                    collected_edges.append(edge)

                if src not in visited_nodes and src in self.nodes:
                    visited_nodes.add(src)
                    queue.append((src, depth + 1))

        nodes_list = [self.nodes[nid] for nid in visited_nodes if nid in self.nodes]
        return nodes_list, collected_edges


class GraphBuilder:
    """
    Constructs a DependencyGraph from parsed symbols, calls, imports,
    and framework contracts.
    """

    def build_graph(
        self,
        symbols: List[Dict[str, Any]],
        imports: List[Dict[str, Any]],
        routes: List[Dict[str, Any]],
        serializers: List[Dict[str, Any]],
        models: List[Dict[str, Any]],
        changed_symbols: Set[str] = None,
    ) -> DependencyGraph:
        graph = DependencyGraph()
        changed_set = changed_symbols or set()

        # 1. Add all Symbols as Nodes
        symbol_by_qname = {}
        for s in symbols:
            qname = s["qualified_name"]
            symbol_by_qname[qname] = s
            graph.add_node(
                node_id=qname,
                label=s["name"],
                node_type=s["symbol_type"],
                file_path=s["file_path"],
                line_number=s["start_line"],
                is_changed=qname in changed_set or s["file_path"] in changed_set,
                metadata=s.get("metadata", {}),
            )

        # 2. Add Call Edges
        for s in symbols:
            caller_qname = s["qualified_name"]
            for call in s.get("calls", []):
                target_name = call["target_name"]
                # Match direct target by function name or suffix
                matched_target = None
                for qname in symbol_by_qname:
                    if qname == target_name or qname.endswith(f".{target_name}"):
                        matched_target = qname
                        break

                if matched_target and matched_target != caller_qname:
                    graph.add_edge(
                        source=caller_qname,
                        target=matched_target,
                        edge_type="calls",
                        provenance="ast_static",
                        certainty="definite",
                        file_path=s["file_path"],
                        line_number=call.get("line_number", 0),
                    )

        # 3. Add Framework Edges: Routes -> Views
        for route in routes:
            view_target = route["view_target"]
            matched_view = None
            for qname in symbol_by_qname:
                if qname.endswith(f".{view_target}"):
                    matched_view = qname
                    break

            route_node_id = f"ROUTE:{route['prefix']}"
            graph.add_node(
                node_id=route_node_id,
                label=route["prefix"],
                node_type="route",
                file_path=route["file_path"],
                line_number=route["line"],
                is_changed=False,
            )

            if matched_view:
                graph.add_edge(
                    source=route_node_id,
                    target=matched_view,
                    edge_type="routes_to",
                    provenance="framework_rule",
                    file_path=route["file_path"],
                    line_number=route["line"],
                )

        # 4. Add Framework Edges: Views -> Serializers
        for s in symbols:
            if "ViewSet" in s["name"] or "View" in s["name"]:
                view_qname = s["qualified_name"]
                # Match serializers mentioned in view body or calls
                for ser in serializers:
                    ser_name = ser["class_name"]
                    # If serializer is called or mentioned
                    has_call = any(
                        ser_name in c.get("target_name", "") for c in s.get("calls", [])
                    )
                    if has_call:
                        for qname in symbol_by_qname:
                            if qname.endswith(f".{ser_name}"):
                                graph.add_edge(
                                    source=view_qname,
                                    target=qname,
                                    edge_type="serializes",
                                    provenance="framework_rule",
                                    file_path=s["file_path"],
                                    line_number=s["start_line"],
                                )

        # 5. Add Test Edges: Tests -> Target Symbols
        for s in symbols:
            if s["file_path"].startswith("tests/") or "test" in s["file_path"]:
                test_qname = s["qualified_name"]
                for call in s.get("calls", []):
                    target_name = call["target_name"]
                    for qname in symbol_by_qname:
                        if not qname.startswith("tests.") and (
                            qname == target_name or qname.endswith(f".{target_name}")
                        ):
                            graph.add_edge(
                                source=test_qname,
                                target=qname,
                                edge_type="tests",
                                provenance="ast_static",
                                file_path=s["file_path"],
                                line_number=call.get("line_number", 0),
                            )

        return graph
