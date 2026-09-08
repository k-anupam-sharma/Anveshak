import logging
import ssl
from backend.config import settings, is_neo4j_configured

logger = logging.getLogger(__name__)

class Neo4jClient:
    def __init__(self):
        self.driver = None
        self.connected = False
        if is_neo4j_configured():
            try:
                from neo4j import GraphDatabase
                # Neo4j Aura on some Python versions needs explicit trust config
                self.driver = GraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
                    encrypted=True,
                    trusted_certificates=None  # accept any (for Aura free tier SSL)
                )
                self.driver.verify_connectivity()
                self.connected = True
                logger.info("Successfully connected to Neo4j Aura")
            except Exception as e:
                logger.error(f"Neo4j connection failed: {e}")
                self.driver = None
                self.connected = False

    def _format_cytoscape(self, nodes, relationships):
        """Convert Neo4j Record objects into Cytoscape.js JSON format."""
        elements = []
        seen_nodes = set()
        seen_rels = set()

        for node in nodes:
            nid = node.get("id", str(node.element_id))
            if nid in seen_nodes:
                continue
            seen_nodes.add(nid)
            props = dict(node)
            elements.append({
                "data": {
                    "id": nid,
                    "label": list(node.labels)[0] if node.labels else "Node",
                    "properties": props
                }
            })

        for rel in relationships:
            rid = str(rel.element_id)
            if rid in seen_rels:
                continue
            seen_rels.add(rid)
            props = dict(rel)
            src = rel.start_node.get("id", str(rel.start_node.element_id))
            tgt = rel.end_node.get("id", str(rel.end_node.element_id))
            elements.append({
                "data": {
                    "id": rid,
                    "source": src,
                    "target": tgt,
                    "label": rel.type,
                    "event_time": props.get("event_time"),
                    "source_record_id": props.get("source_record_id"),
                    "properties": props
                }
            })
        return elements

    def get_entity_neighborhood(self, entity_id: str):
        """Fetch 1-2 hop neighborhood of an entity."""
        if not self.connected:
            raise RuntimeError("Neo4j connection failed. Live graph data is unavailable.")

        query = """
        MATCH path = (n {id: $entity_id})-[*0..2]-(m)
        UNWIND nodes(path) AS node
        UNWIND relationships(path) AS rel
        RETURN collect(DISTINCT node) as nodes, collect(DISTINCT rel) as relationships
        """
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                result = session.run(query, entity_id=entity_id).single()
                if not result or not result["nodes"]:
                    return []
                return self._format_cytoscape(result["nodes"], result["relationships"])
        except Exception as e:
            logger.error(f"Neo4j query failed: {e}")
            raise RuntimeError("Neo4j connection failed. Live graph data is unavailable.")

    def get_case_neighborhood(self, case_id: str):
        """Fetch neighborhood of a case node."""
        if not self.connected:
            raise RuntimeError("Neo4j connection failed. Live graph data is unavailable.")

        query = """
        MATCH path = (c:Case {id: $case_id})-[*0..2]-(m)
        UNWIND nodes(path) AS node
        UNWIND relationships(path) AS rel
        RETURN collect(DISTINCT node) as nodes, collect(DISTINCT rel) as relationships
        """
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                result = session.run(query, case_id=case_id).single()
                if not result or not result["nodes"]:
                    return []
                return self._format_cytoscape(result["nodes"], result["relationships"])
        except Exception as e:
            logger.error(f"Neo4j query failed: {e}")
            raise RuntimeError("Neo4j connection failed. Live graph data is unavailable.")

    def explain_connection(self, source_id: str, target_id: str):
        """Find shortest path between two entities."""
        if not self.connected:
            raise RuntimeError("Neo4j connection failed. Live graph data is unavailable.")

        query = """
        MATCH path = shortestPath((a {id: $source_id})-[*1..6]-(b {id: $target_id}))
        RETURN nodes(path) as nodes, relationships(path) as relationships
        """
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                result = session.run(query, source_id=source_id, target_id=target_id).single()
                if not result or not result["nodes"]:
                    return {"path": [], "explanation": "No connection found within 6 hops.", "hops": 0}

                nodes = result["nodes"]
                rels = result["relationships"]
                path_elements = []
                parts = []

                for i, node in enumerate(nodes):
                    name = node.get("name") or node.get("fir_number") or node.get("id")
                    path_elements.append({"entity": name, "type": list(node.labels)[0] if node.labels else "Unknown"})
                    if i < len(rels):
                        rel = rels[i]
                        path_elements.append({
                            "relationship": rel.type,
                            "evidence": rel.get("source_record_id", "Known association"),
                            "event_time": rel.get("event_time")
                        })
                        parts.append(f"{name} → [{rel.type.replace('_', ' ')}]")

                last_name = nodes[-1].get("name") or nodes[-1].get("id")
                parts.append(last_name)
                explanation = " → ".join(parts) if parts else "Direct connection."

                return {"hops": len(rels), "path": path_elements, "explanation": explanation}
        except Exception as e:
            logger.error(f"Neo4j explain query failed: {e}")
            raise RuntimeError("Neo4j connection failed. Live graph data is unavailable.")

    def get_full_graph(self, limit: int = 500):
        """Return the full investigation network."""
        if not self.connected:
            raise RuntimeError("Neo4j connection failed. Live graph data is unavailable.")

        query = """
        MATCH (n)
        OPTIONAL MATCH (n)-[r]-(m)
        WITH collect(DISTINCT n) + collect(DISTINCT m) AS allNodes, collect(DISTINCT r) AS allRels
        UNWIND allNodes AS node
        WITH collect(DISTINCT node) AS nodes, allRels
        RETURN nodes, allRels AS relationships
        LIMIT $limit
        """
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                result = session.run(query, limit=limit).single()
                if not result or not result["nodes"]:
                    return []
                return self._format_cytoscape(result["nodes"], result["relationships"])
        except Exception as e:
            logger.error(f"Neo4j full graph query failed: {e}")
            raise RuntimeError("Neo4j connection failed. Live graph data is unavailable.")




neo4j_client = Neo4jClient()
