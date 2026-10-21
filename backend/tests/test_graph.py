from apps.impacts.graph_builder import DependencyGraph


def test_dependency_graph_cycle_and_blast_radius():
    graph = DependencyGraph()

    # Add Nodes
    graph.add_node("views.create", "create", "method", "views.py", 10, is_changed=False)
    graph.add_node("services.enroll", "enroll", "function", "services.py", 20, is_changed=True)
    graph.add_node("models.Employee", "Employee", "class", "models.py", 30, is_changed=False)
    graph.add_node("tests.test_enroll", "test_enroll", "function", "tests.py", 40, is_changed=False)

    # Add Edges (including a cyclic edge for cycle-handling test)
    graph.add_edge("views.create", "services.enroll", "calls")
    graph.add_edge("services.enroll", "models.Employee", "writes_model")
    graph.add_edge("services.enroll", "services.enroll", "calls")  # self-recursion cycle
    graph.add_edge("tests.test_enroll", "services.enroll", "tests")

    # Blast radius traversal rooted at changed symbol 'services.enroll'
    nodes, edges = graph.get_blast_radius(["services.enroll"], max_radius=2)
    node_ids = [n["id"] for n in nodes]

    assert "services.enroll" in node_ids
    assert "models.Employee" in node_ids  # Downstream
    assert "views.create" in node_ids     # Upstream caller
    assert "tests.test_enroll" in node_ids # Test
    assert len(edges) >= 3
