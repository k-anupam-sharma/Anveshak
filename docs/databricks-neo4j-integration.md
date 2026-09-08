# Databricks to Neo4j Integration Strategy

## The Pattern

Anveshak employs a **CQRS (Command Query Responsibility Segregation) inspired pattern** for graph data:
1. **Source of Truth**: Databricks Gold tables act as the immutable source of truth for all relationships and entity histories.
2. **Read-Optimized View**: Neo4j Aura acts as a specialized index for rapid graph traversal, pathfinding, and neighborhood discovery.

## Synchronization Approach

To keep Neo4j in sync with Databricks without overloading the database:

### 1. Batch Initialization (Nightly)
A Databricks Notebook or Apache Airflow job runs a nightly sync:
- Extracts `workspace.anveshak_gold.graph_nodes`
- Extracts `workspace.anveshak_gold.graph_edges`
- Uses the Neo4j Spark Connector or `neo4j-admin` bulk import to overwrite the Neo4j database.

### 2. Micro-batch Updates (Hourly / On-Demand)
- For rapidly changing data (e.g. newly created leads or confirmed connections), a micro-batch pipeline pushes only incremental changes (using a watermark/timestamp column `updated_at` in Databricks).

## Query Segregation in FastAPI

- **Neo4j Cypher**: Used exclusively for finding paths (e.g. `shortestPath`) and getting immediate N-hop neighbors.
- **Databricks SQL**: Used for everything else (fetching Case details, summarizing timelines, calculating dashboard metrics, and generating complex alerts).
