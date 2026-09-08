# System Architecture

## Overview
Anveshak is an AI-assisted criminal-investigation network platform built to be robust, secure, and presentation-ready.

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + custom shadcn-inspired components
- **Animations**: Framer Motion
- **Visualization**: React Flow (Graph), Recharts (Dashboards)
- **Backend**: FastAPI (Python)
- **Databases**: Databricks (Analytical Data), Neo4j Aura (Graph Topology)

## Data Flow
1. **Frontend**: Requests data from REST endpoints on the FastAPI backend.
2. **Backend (FastAPI)**: 
   - Checks authentication (role-based).
   - If `is_demo_mode()` is True, it intercepts the request and serves high-quality synthetic data directly from `mock_data.py`.
   - If `is_demo_mode()` is False, it dispatches Graph traversal requests to Neo4j, and heavy analytical/timeline requests to Databricks SQL Warehouse.
3. **Databricks**: Stores Bronze/Silver/Gold tiered data. Anveshak exclusively reads from `workspace.anveshak_gold`.
4. **Neo4j**: Stores topological data (Entities and Relationships) for rapid multi-hop pathfinding (`shortestPath` queries).

## Security
- The frontend never connects to Databricks or Neo4j directly.
- Credentials are read exclusively from `.env` in the backend and never committed.
- API endpoints check role claims (`admin`, `investigator`, `supervisor`) before granting access to sensitive routes.
