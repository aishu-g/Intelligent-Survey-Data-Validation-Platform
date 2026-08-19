import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import {
  ShieldCheck,
  BrainCircuit,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  Layers,
  Cpu,
  Lock,
  LineChart,
  FileCheck,
  GitMerge,
  Sparkles,
  Server,
  Zap,
  TrendingDown,
  Clock,
  RefreshCw,
  Award,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#0A0D23] text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* 1. Sticky Navbar */}
      <Navbar />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#12163B] via-[#0E1231] to-[#0A0D23] text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-teal-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>HEXAWARE HACKATHON · MoSPI / NSO PROBLEM STATEMENT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Intelligent Survey Data <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">Validation Platform</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-teal-200/90 font-medium max-w-3xl mx-auto">
            Probabilistic & Machine-Learning Powered Anomaly Detection for PLFS and Future National Surveys
          </p>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Transforming static hard and soft survey validation into an adaptive, historically-informed quality assurance engine. ISDVP empowers HSD officials to detect multi-variate discrepancies, temporal drift, and enumerator clustering before statistical publication.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app/dashboard"
              id="hero-launch-btn"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>Launch Platform Demo</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#architecture"
              id="hero-arch-btn"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-200 backdrop-blur-xs"
            >
              <span>View Architecture</span>
              <ChevronRight className="w-4 h-4 text-teal-400" />
            </a>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/10 text-left">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-2xl font-extrabold text-teal-400 block">75%+</span>
              <span className="text-xs text-slate-300 font-medium">Reduction in Manual Review Overhead</span>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-2xl font-extrabold text-teal-400 block">300+</span>
              <span className="text-xs text-slate-300 font-medium">PSU Multivariate Correlations</span>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-2xl font-extrabold text-teal-400 block">&lt; 150ms</span>
              <span className="text-xs text-slate-300 font-medium">SHAP Inference & Flag Latency</span>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-2xl font-extrabold text-teal-400 block">100%</span>
              <span className="text-xs text-slate-300 font-medium">Self-Contained On-Prem Deployment</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Section ("Why Existing Validation Falls Short") */}
      <section id="problem" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Current Limitations</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Why Existing Validation Falls Short
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            National statistical pipelines (such as eSigma / CAPI) depend on predetermined, hard-coded field ranges. As survey volume grows, sophisticated data distortions slip through undetected.
          </p>
        </div>

        {/* Core Gap Callout */}
        <div className="mt-10 p-6 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 dark:border-amber-400 text-slate-800 dark:text-slate-200 max-w-4xl mx-auto shadow-sm">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-amber-600 dark:text-amber-400 min-w-[24px] mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-amber-900 dark:text-amber-300">The Core Gap</h3>
              <p className="text-xs sm:text-sm mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                Static validation answers <em>"Is this value within a fixed theoretical range?"</em>, but cannot answer <em>"Is this response pattern statistically plausible given the household's sub-district socio-economic cohort, historical rounds, and enumerator baseline?"</em>
              </p>
            </div>
          </div>
        </div>

        {/* 4-Card Problem Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-[#151A38] border-l-4 border-teal-500 border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold mb-4">01</div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">No Historical Context</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Validation is isolated per record. Round-over-round panel shifts and sudden roster transitions cannot be correlated across survey quarters.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#151A38] border-l-4 border-teal-500 border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold mb-4">02</div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">No Anomaly Detection</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Multi-attribute contradictions (e.g. high consumer expenditure with zero declared income) pass standard range checks when isolated.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#151A38] border-l-4 border-teal-500 border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold mb-4">03</div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Manual Aggregate Analysis</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Cross-tabulations and cluster-level variance audits are performed manually months after fieldwork ends, delaying official publication.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#151A38] border-l-4 border-teal-500 border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold mb-4">04</div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Single-Survey Static Rules</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Validation logic is tightly coupled to individual survey schemas and cannot be readily ported to ASI, HCES, or new specialized inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Objectives Section ("What the Platform Must Deliver") */}
      <section id="objectives" className="py-20 bg-slate-100 dark:bg-[#0E1231]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Core Objectives</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              What the Platform Must Deliver
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
              Five strategic pillars engineered to modernize India's survey validation infrastructure.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {[
              {
                num: '01',
                title: 'Modular Multi-Survey Engine',
                desc: 'Survey-agnostic data modeling framework supporting PLFS, HCES, and ASI without redesigning core validation layers.',
              },
              {
                num: '02',
                title: 'Probabilistic + ML Detection',
                desc: 'Dual-engine combining deterministic rule execution with unsupervised ML (Isolation Forest, Autoencoders, Bayesian hierarchical models).',
              },
              {
                num: '03',
                title: 'Rigorous Evaluation & SHAP',
                desc: 'Transparent explainability metrics showing exact feature contributions and z-score distances for every flagged item.',
              },
              {
                num: '04',
                title: 'Hands-on HSD Training',
                desc: 'Intuitive triage workflows designed for field supervisors and statistical officers with one-click resolution and audit trails.',
              },
              {
                num: '05',
                title: 'eSigma Integration Roadmap',
                desc: 'Standardized REST and Kafka event interfaces ready for seamless plug-in to CAPI field devices and central MoSPI databases.',
              },
            ].map((obj) => (
              <div key={obj.num} className="p-6 rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-teal-500 transition-colors">
                <span className="text-3xl font-black text-teal-500/40 group-hover:text-teal-400 transition-colors block mb-2 font-mono">
                  {obj.num}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{obj.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Layered Architecture Section */}
      <section id="architecture" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">System Blueprint</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Layered Platform Architecture
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
            Five sequential pipeline tiers ensuring continuous integrity, probabilistic scoring, and transparent triage.
          </p>
        </div>

        <div className="mt-12 space-y-4 max-w-4xl mx-auto">
          {[
            {
              icon: Database,
              title: 'Ingestion Layer',
              desc: 'Dual-mode ingestion via REST endpoints or batch CSV/Parquet uploads with schema validation.',
            },
            {
              icon: FileCheck,
              title: 'Integrity & Rules Engine',
              desc: 'Deterministic referential, range, existential, and cross-field formula validations.',
            },
            {
              icon: BrainCircuit,
              title: 'Probabilistic & ML Core',
              desc: 'Isolation Forest, Bayesian regression, DBSCAN clustering, and SHAP explainability scoring.',
            },
            {
              icon: AlertOctagon,
              title: 'Anomaly Scoring & Flagging',
              desc: 'Weighted multi-level scoring (0-100), automated prioritization, and deduplication queue.',
            },
            {
              icon: LineChart,
              title: 'Dashboards & Reporting',
              desc: 'Interactive triage workbench, real-time KPI telemetry, and executive PDF/CSV audits.',
            },
          ].map((layer, idx) => {
            const Icon = layer.icon;
            return (
              <div
                key={layer.title}
                className="p-5 rounded-xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 hover:border-teal-500 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center min-w-[48px]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-500">Tier 0{idx + 1}</span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{layer.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{layer.desc}</p>
                  </div>
                </div>
                <div className="hidden sm:block text-slate-400">
                  <ChevronRight className="w-5 h-5 text-teal-500" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. System Flow Diagram (SVG / Flexbox) */}
      <section id="flow" className="py-20 bg-[#12163B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Workflow Pipeline</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              End-to-End System Flow
            </h2>
            <p className="mt-3 text-slate-300 text-sm">
              How raw field transmissions transform into verified statistical trust.
            </p>
          </div>

          {/* Diagram Container */}
          <div className="mt-12 p-8 rounded-2xl bg-[#0E1231] border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
              {/* Box 1 */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto mb-3">
                  <Database className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-sm text-teal-300">Data Sources</h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  eSigma / CAPI Field Units + Historical Surveys + MinIO / PostgreSQL
                </p>
              </div>

              {/* Box 2 */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-sm text-indigo-300">Streaming & Pipeline</h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  Apache Kafka Message Queues + Apache Airflow Orchestration
                </p>
              </div>

              {/* Box 3 */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-3">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-sm text-emerald-300">Validation Engine</h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  Rules Studio + Statistical Estimators + ML Anomaly Detectors + SHAP
                </p>
              </div>

              {/* Box 4 */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-sm text-rose-300">Triage & Officials</h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  HSD Officers Workbench + Automated Alerts + PDF/CSV Audit Exports
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400 max-w-2xl mx-auto italic border-t border-white/10 pt-4">
              "Security & governance (Keycloak SSO, RBAC, TLS, audit logs) and observability (Prometheus/Grafana) wrap every layer."
            </p>
          </div>
        </div>
      </section>

      {/* 7. Tech Stack Section ("Open-Source, Cloud-Ready Foundation") */}
      <section id="techstack" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Engineering Architecture</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Open-Source, Cloud-Ready Foundation
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
            Target production technology stack for enterprise national statistical deployment.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              category: 'Frontend & UX',
              stack: 'React 18, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Vite',
              desc: 'High-performance interactive triage workbench with accessible GovTech components.',
            },
            {
              category: 'Backend Services',
              stack: 'Node.js, Express, TypeScript, Prisma ORM, REST APIs',
              desc: 'Modular, typed micro-services with rapid query execution and schema migrations.',
            },
            {
              category: 'Data Engineering',
              stack: 'Apache Kafka, Apache Airflow, Python Data Streamers',
              desc: 'Event-driven message distribution and scheduled batch ETL pipelines.',
            },
            {
              category: 'Probabilistic & ML',
              stack: 'scikit-learn, PyOD, SHAP, Prophet, PyMC3',
              desc: 'Unsupervised anomaly detection, spatial clustering, and feature attribution models.',
            },
            {
              category: 'Data Storage',
              stack: 'PostgreSQL, SQLite, MongoDB, MinIO S3 Object Storage',
              desc: 'Relational data stores for structured surveys and object storage for raw artifacts.',
            },
            {
              category: 'DevOps & Cloud',
              stack: 'Docker, Kubernetes, Helm, MLflow Registry',
              desc: 'Containerized orchestration with on-prem air-gapped readiness.',
            },
            {
              category: 'Security & Governance',
              stack: 'Keycloak SSO, JWT, Role-Based Access Control, TLS 1.3',
              desc: 'Granular role delegation and immutable cryptographic audit trails.',
            },
            {
              category: 'Monitoring & BI',
              stack: 'Prometheus, Grafana, Apache Superset',
              desc: 'Real-time telemetry and national-level statistical reporting dashboards.',
            },
          ].map((item) => (
            <div key={item.category} className="p-5 rounded-xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-teal-600 dark:text-teal-400">{item.category}</h4>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">{item.stack}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Modeling Approach Table */}
      <section className="py-20 bg-slate-100 dark:bg-[#0E1231]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Analytical Depth</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Probabilistic & ML Techniques by Detection Level
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
              Comprehensive statistical modeling tailored to multi-tiered survey topologies.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white dark:bg-[#151A38] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-[#12163B] text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Detection Level</th>
                  <th className="p-4">Probabilistic & ML Technique</th>
                  <th className="p-4">Target Survey Anomaly</th>
                  <th className="p-4">Statistical Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-bold text-teal-600 dark:text-teal-400">Record Level</td>
                  <td className="p-4 font-medium">Isolation Forest & One-Class SVM</td>
                  <td className="p-4">Extreme multi-attribute discrepancies (HCE vs Income vs HH Size)</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">Path-length tree partitioning in high-dimensional space</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-bold text-teal-600 dark:text-teal-400">Cluster (PSU) Level</td>
                  <td className="p-4 font-medium">DBSCAN & Local Outlier Factor (LOF)</td>
                  <td className="p-4">Geographic or socio-economic cluster deviations</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">Density-based local neighborhood distance scoring</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-bold text-teal-600 dark:text-teal-400">Temporal / Drift</td>
                  <td className="p-4 font-medium">ARIMA, Prophet & CUSUM Change Point</td>
                  <td className="p-4">Round-over-round panel structural drift</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">Sequential Bayesian mean-shift hypothesis testing</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-bold text-teal-600 dark:text-teal-400">Aggregate / State Level</td>
                  <td className="p-4 font-medium">Bayesian Hierarchical Regression</td>
                  <td className="p-4">Discrepant regional demographic estimates</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">Shrinkage estimation borrowing statistical power across strata</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-bold text-teal-600 dark:text-teal-400">Deep Pattern Detection</td>
                  <td className="p-4 font-medium">Variational Autoencoders (VAE)</td>
                  <td className="p-4">Subtle non-linear enumerator bias / fabrications</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">Reconstruction loss minimization across latent vectors</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-bold text-teal-600 dark:text-teal-400">Explainability</td>
                  <td className="p-4 font-medium">TreeSHAP & KernelSHAP</td>
                  <td className="p-4">Black-box validation opacity for field officers</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">Game-theoretic Shapley feature attribution decomposition</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. Core Features Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Platform Capabilities</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Engineered for High-Stakes Official Statistics
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
            Eight mission-critical modules powering end-to-end survey data trustworthiness.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Dual-Mode Ingestion', desc: 'Real-time API ingestion and high-throughput batch CSV parsing with automatic schema verification.' },
            { title: 'Model Builder', desc: 'Simulate and benchmark unsupervised machine learning models tailored to PLFS sub-district strata.' },
            { title: 'Integrity Rule Studio', desc: 'Visual formula builder for referential, range, and multi-field conditional constraints.' },
            { title: 'Automated Flagging', desc: 'Priority anomaly queue ranked by multi-variate confidence scores and statistical severity.' },
            { title: 'Interactive Review', desc: 'Accept, escalate, or classify false positives with full audit trails and reviewer attribution.' },
            { title: 'Performance Dashboards', desc: 'Live KPI telemetry, severity breakdowns, and temporal trend analyses powered by Recharts.' },
            { title: 'Reporting & Export', desc: 'Generate official MoSPI/NSO branded PDF audit summaries and filtered CSV rosters in-browser.' },
            { title: 'Security & Compliance', desc: 'Role-based access control (Admin, HSD Official, Viewer) with secure bcrypt & JWT authentication.' },
          ].map((feat, idx) => (
            <div key={feat.title} className="p-6 rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-500 font-bold flex items-center justify-center mb-3">
                0{idx + 1}
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{feat.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Innovation Section (Dark background, 6-card grid) */}
      <section className="py-20 bg-[#12163B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Paradigm Shift</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              What Makes This Different
            </h2>
            <p className="mt-3 text-slate-300 text-sm">
              Moving beyond static boundary checks into continuous probabilistic assurance.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Static → Adaptive',
                desc: 'Validation thresholds learn and adapt based on empirical regional distributions rather than fixed national constants.',
              },
              {
                title: 'Multi-Level Scoring',
                desc: 'Combines record-level, cluster-level, and enumerator-level statistical signals into a single composite confidence index.',
              },
              {
                title: 'Explainable Flags',
                desc: 'Every anomaly includes plain-language SHAP reasoning so field officials understand the exact mathematical cause.',
              },
              {
                title: 'Survey-Agnostic Core',
                desc: 'Unified schema engine capable of validating PLFS, ASI, HCES, and future periodic inquiries without code modifications.',
              },
              {
                title: 'Active Feedback Loop',
                desc: 'Supervisor acceptances and false-positive flags dynamically calibrate model thresholds for subsequent rounds.',
              },
              {
                title: 'Offline-First Field Use',
                desc: 'Edge-compatible scoring rules can be compiled into CAPI Android/tablet packages for instant field validation.',
              },
            ].map((innov) => (
              <div key={innov.title} className="p-6 rounded-2xl bg-[#0E1231] border border-white/10 hover:border-teal-400 transition-colors">
                <h4 className="font-bold text-base text-teal-300 mb-2">{innov.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{innov.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Comparison Table */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Technological Evolution</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Beyond the Existing eSigma/CAPI Setup
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
            Comparison between current field validation mechanisms and the ISDVP platform.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white dark:bg-[#151A38] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-[#12163B] text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Dimension</th>
                <th className="p-4 text-slate-500">Today (eSigma / CAPI)</th>
                <th className="p-4 text-teal-600 dark:text-teal-400">Proposed Platform (ISDVP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4 font-bold">Validation Logic</td>
                <td className="p-4 text-slate-500">Hard-coded static ranges per field</td>
                <td className="p-4 font-medium text-teal-600 dark:text-teal-300">Adaptive ML + multi-field dynamic rules</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4 font-bold">Historical Context</td>
                <td className="p-4 text-slate-500">None; each submission validated in vacuum</td>
                <td className="p-4 font-medium text-teal-600 dark:text-teal-300">Cross-round panel and regional baseline drift awareness</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4 font-bold">Detection Scope</td>
                <td className="p-4 text-slate-500">Syntax errors & out-of-bound numbers</td>
                <td className="p-4 font-medium text-teal-600 dark:text-teal-300">Multi-variate outliers, enumerator bias, and spatial clusters</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4 font-bold">Aggregate Analysis</td>
                <td className="p-4 text-slate-500">Manual post-hoc statistical tabulations</td>
                <td className="p-4 font-medium text-teal-600 dark:text-teal-300">Automated continuous anomaly scoring & live telemetry</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4 font-bold">Coverage</td>
                <td className="p-4 text-slate-500">Hardcoded to PLFS questionnaire</td>
                <td className="p-4 font-medium text-teal-600 dark:text-teal-300">Modular schema supporting PLFS, HCES, ASI, etc.</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4 font-bold">Transparency</td>
                <td className="p-4 text-slate-500">Binary pass/fail error prompts</td>
                <td className="p-4 font-medium text-teal-600 dark:text-teal-300">SHAP-based natural language explainability reasoning</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4 font-bold">Deployment</td>
                <td className="p-4 text-slate-500">Tightly coupled monolith</td>
                <td className="p-4 font-medium text-teal-600 dark:text-teal-300">Modular, cloud-ready, self-contained or containerized</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 12. Business Impact Section */}
      <section id="impact" className="py-20 bg-slate-100 dark:bg-[#0E1231]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Measurable Value</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              National Statistical Impact
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
              Delivering speed, precision, and institutional trust for MoSPI decision-makers.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <TrendingDown className="w-8 h-8 text-teal-500 mx-auto mb-2" />
              <span className="text-3xl font-extrabold text-teal-500 block">↓ 75%</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white block mt-1">Manual Review Effort</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Prioritized queue eliminates reviewing thousands of compliant records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <Award className="w-8 h-8 text-teal-500 mx-auto mb-2" />
              <span className="text-3xl font-extrabold text-teal-500 block">↑ 98%</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white block mt-1">Data Quality & Trust</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Detects multi-attribute distortions invisible to standard range checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <Clock className="w-8 h-8 text-teal-500 mx-auto mb-2" />
              <span className="text-3xl font-extrabold text-teal-500 block">↓ 60%</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white block mt-1">Time-to-Insight</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Accelerates quarterly publication timelines through automated triage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <RefreshCw className="w-8 h-8 text-teal-500 mx-auto mb-2" />
              <span className="text-3xl font-extrabold text-teal-500 block">↑ 100%</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white block mt-1">Cross-Survey Reusability</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Plug-and-play validation core across all official economic surveys.
              </p>
            </div>
          </div>

          {/* Strategic Alignment Bullets */}
          <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Strategic Alignment with National Statistical Priorities:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 min-w-[16px] mt-0.5" />
                <span>Supports MoSPI's digital transformation roadmap toward automated statistical governance.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 min-w-[16px] mt-0.5" />
                <span>Empowers HSD Field Officers with transparent, non-punitive diagnostic intelligence.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 min-w-[16px] mt-0.5" />
                <span>Guarantees self-contained, air-gapped on-premise execution with zero external vendor lock-in.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 min-w-[16px] mt-0.5" />
                <span>Establishes empirical baselines for cross-departmental data linkage across ministries.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Roadmap ("Phased Path to eSigma Integration") */}
      <section id="roadmap" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Execution Plan</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Phased Path to eSigma Integration
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
            A 5-phase progressive deployment strategy for nationwide rollout.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { phase: 'Phase 01', title: 'Foundation', desc: 'Core rule studio, baseline PLFS synthetic ingestion, and role-based access setup.' },
            { phase: 'Phase 02', title: 'Model Development', desc: 'Training Isolation Forest, Bayesian regression, and SHAP explainability kernels.' },
            { phase: 'Phase 03', title: 'Pilot & Training', desc: 'Field trial with regional HSD offices; gathering user feedback on triage usability.' },
            { phase: 'Phase 04', title: 'eSigma Integration', desc: 'Direct Kafka connector and CAPI field tablet APK offline validation sync.' },
            { phase: 'Phase 05', title: 'Scale-Out', desc: 'Extending models to ASI, HCES, and national annual statistical releases.' },
          ].map((step, idx) => (
            <div key={step.phase} className="p-5 rounded-2xl bg-white dark:bg-[#151A38] border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <span className="text-xs font-mono font-bold text-teal-500 block mb-1">{step.phase}</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{step.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 14. Footer CTA & GovTech Footer Bar */}
      <footer className="bg-[#12163B] text-white border-t border-white/10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              From Static Checks to Intelligent Data Trust
            </h3>
            <p className="mt-3 text-slate-300 text-sm">
              Experience the live validation studio, triage anomaly flags, and benchmark machine learning models.
            </p>
            <div className="mt-8">
              <Link
                to="/app/dashboard"
                id="footer-launch-btn"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 shadow-xl shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Launch Platform Demo</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>ISDVP · MoSPI / NSO Prototype · Hexaware Hackathon</span>
            </div>
            <div>
              <span>Open-Source GovTech Demonstration Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
