# AI-Driven GitHub Technical Auditor & Profile Intelligence

An intelligent developer portfolio analyzer that bridges the gap between vanity GitHub statistics and real-world engineering capability. Built with React, Vite, Recharts, and Groq Cloud LPU inference.

---

##  Overview

Traditional resume screening and ATS filters often miss an engineer's true technical depth. Meanwhile, standard GitHub profile visualizers overemphasize superficial vanity metrics—such as commit streaks, star counts, or raw language percentages—without distinguishing between low-effort tutorial forks and deployed, production-grade applications.

This Software extracts real-time repository metadata through the GitHub REST API, cleans and filters out forks, and runs qualitative technical audits using an open-weight LLM on Groq’s high-speed inference engine.

---

##  Key Features

* ** Engineering Archetype Detection:** Analyzes codebases, language distribution, and project scopes to determine the developer’s builder persona (e.g., *Full-Stack Web Engineer with AI Focus*).
* ** Production vs. Toy Project Separation:** Automatically separates sandbox experiments and tutorial clones from production-ready systems by checking deployment URLs (`homepage`), project longevity, and repository structure.
* ** Heuristic Code Health Scoring:** Evaluates repository maintenance cadences, update consistency, and recent commit velocity to provide a 0–100 health audit.
* ** Visual Contribution & Language Breakdown:** Interactive charts powered by Recharts, visualizing lifetime activity curves and multi-language stack ratios.
* ** Sub-Second Inference:** Powered by Groq LPU hardware for near-instant profile audits with constrained JSON decoding.

---

##  Architecture & Data Pipeline
The application uses an event-driven, client-orchestrated data pipeline designed to minimize token usage, eliminate hallucinations, and deliver sub-second evaluations.


                ┌─────────────────────────┐
                │      User Search        │
                │  (e.g., github/username)│
                └────────────┬────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │    GitHub REST APIs     │
                │   /users, /repos, etc.  │
                └────────────┬────────────┘
                             │
                 [Raw Data: 70+ Keys/Repo]
                             │
                             ▼
                ┌─────────────────────────┐
                │ Client-Side Filter/Pipe │
                │   .filter() -> Non-fork │
                │   .slice(0, 10)         │
                │   .map() -> 6 Key Props │
                └────────────┬────────────┘
                             │
                [Lean Payload: ~85% Less Tokens]
                             │
                             ▼
                ┌─────────────────────────┐
                │   Groq LPU Inference    │
                │   Model: gpt-oss-20b    │
                │  Format: "json_object"  │
                └────────────┬────────────┘
                             │
               [Constrained Valid JSON String]
                             │
                             ▼
                ┌─────────────────────────┐
                │ Defensive Parse & State │
                │   JSON.parse() + ?.     │
                │      setaiInsights      │
                └────────────┬────────────┘
                             │
             ┌───────────────┴───────────────┐
             ▼                               ▼
  ┌─────────────────────┐         ┌─────────────────────┐
  │  Left Panel: Stats  │         │ Right Panel: Audit  │
  │ Recharts (Line/Pie) │         │ Archetype & Health  │
  └─────────────────────┘         └─────────────────────┘


---

##  Tech Stack

* **Frontend:** React 18, Vite, Lucide React
* **Data Visualization:** Recharts
* **Data Fetching:** GitHub REST API, BerrySauce Pinned Repos API
* **Inference Engine:** Groq Cloud SDK / REST API
* **Model:** `openai/gpt-oss-20b`

---

##  How to Clone and Run Locally

Follow these steps to run the application on your local machine:

### Prerequisites
* **Node.js** (v18.0 or higher installed)
* **npm** (comes packaged with Node.js)
* A free **Groq Cloud API Key** (obtainable at [console.groq.com](https://console.groq.com/keys))

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git)

### 2. Navigate to the Project Directory
Change directory into the root folder of the project:
```bash
cd YOUR_REPOSITORY_NAME

3. Install Dependencies
Install all required project dependencies (react, recharts, lucide-react, vite):

Bash
npm install

4. Configure Environment Variables
Create a .env file in the root directory (at the same level as package.json):

Bash
touch .env

5. Open the .env file and insert your Groq API key:

VITE_GROQ_API_KEY_PLAYGROUND=your_actual_groq_api_key_here

6. Start the Development Server
Launch the local development environment:

Bash
npm run dev

7.Once the terminal confirms the build is ready, open your browser and go directly to:

http://localhost:5173/
 
