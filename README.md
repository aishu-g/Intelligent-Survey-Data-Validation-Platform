# Intelligent Survey Data Validation Platform (ISDVP)
### Probabilistic & Machine-Learning Powered Anomaly Detection for PLFS and Official National Surveys
**MoSPI / NSO (National Statistical Office, India) Problem Statement**

---

## 🌟 Overview

The **Intelligent Survey Data Validation Platform (ISDVP)** is a next-generation survey data quality and anomaly detection platform designed for the Ministry of Statistics and Programme Implementation (MoSPI) and the National Statistical Office (NSO). 

Traditional validation in survey pipelines like **eSigma / CAPI** relies predominantly on static hard and soft validation checks. While effective at catching syntax and basic range violations, they struggle to identify:
1. **Multivariate outliers** across correlated economic variables (e.g. Household Expenditure vs Income vs Family Size).
2. **Temporal & Round-over-Round Drift** where respondent or cluster characteristics drift unnaturally across survey rounds.
3. **Enumerator-level Systematic Bias or Fabrications** exhibiting clustered or low-variance responses.
4. **Aggregate & PSU Clustering Anomalies** that defy local socio-economic benchmarks.

ISDVP provides a modular, explainable, and multi-tiered validation layer combining:
- **Deterministic Referential & Cross-Field Rules Studio**
- **Probabilistic & Statistical Anomaly Detection**
- **Unsupervised ML Scoring (Isolation Forest, One-Class SVM, Autoencoders)**
- **SHAP-style Transparent Explainability** for survey data officers (HSD officials)

---

## 🚀 Quick Start (Local Setup)

The platform is completely self-contained and runs on **Node.js, Express, Prisma, SQLite, React, and Vite**. Zero cloud setup or external database installations required.

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Installation
From the root repository directory:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 3. Database Initialization & Seeding
```bash
# Generate Prisma Client and populate with realistic PLFS synthetic data
npm run seed
```
*(Note: If you run `npm run dev` directly, the backend server will automatically detect an empty SQLite database and execute the seed automatically!)*

### 4. Start the Application
```bash
npm run dev
```
- **Public Marketing & Pitch Site**: [http://localhost:5173/](http://localhost:5173/)
- **Working Platform**: [http://localhost:5173/app/dashboard](http://localhost:5173/app/dashboard)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔑 Demo Accounts

For quick evaluation, the `/login` page includes **1-Click Demo Login** buttons:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@mospi.gov.in` | `Admin@123` | Full access: View & edit all surveys, create & execute rules, triage flags, train models, generate reports, manage user roles. |
| **HSD Official** | `hsd.official@mospi.gov.in` | `Hsd@123` | Survey operations: Ingestion, rule execution, flag triage (Accept/Override/False Positive), model inspection, reporting. |
| **Viewer** | `viewer@mospi.gov.in` | `Viewer@123` | Read-only analytics & triage inspection. |

---

## 🏗️ Architecture & Modules

### Monorepo Structure
```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Relational schema (User, Batch, Record, Rule, Flag, MLModel, Report)
│   │   └── seed.ts             # Programmatic PLFS synthetic generator with seeded randomness
│   └── src/
│       ├── index.ts            # Express server entry point with auto-seed hooks
│       ├── middleware/auth.ts  # JWT verification & RBAC role checks
│       ├── routes/             # REST controllers for Auth, Batches, Records, Rules, Flags, Models, Reports, Users
│       └── utils/              # Rule query evaluation engine & deterministic ML simulation
└── frontend/
    ├── src/
    │   ├── components/         # Modern GovTech UI components (Sidebar, Topbar, Modals, Drawers)
    │   ├── context/            # AuthContext and persistent ThemeContext
    │   ├── pages/              # LandingPage (14 sections), Dashboard, Ingestion, Rules, Flags, Models, Reports, Settings
    │   └── utils/              # Client-side CSV parser & jsPDF executive report generator
```

---

## 📊 Core Features

1. **Dual-Mode Ingestion**: Upload batches or trigger simulated live CAPI stream ingestion with instant statistical indexing.
2. **Dynamic Validation Studio**: Define and run cross-field, range, and existential rules with live SQL/Prisma evaluation against survey records.
3. **Multi-Tiered Flag Queue**: Priority-ranked anomaly triage queue with plain-language SHAP explainability summaries (e.g. *"Reported expenditure 3.2x higher than district median for this household size"*).
4. **Interactive Review Actions**: One-click Accept, Mark False Positive, and Escalate flags with audit attribution.
5. **Model Registry & Simulation**: Test and benchmark Isolation Forest, DBSCAN, and Bayesian Hierarchical models against real batches.
6. **Executive PDF & CSV Reports**: Export branded MoSPI/NSO data quality audit summaries directly in-browser.
7. **Role-Based Access Control (RBAC)**: Fine-grained security protecting administrative user controls and sensitive survey records.
