# Orbital Finance 🌍 

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Stack](https://img.shields.io/badge/stack-React_TypeScript_Tailwind-cyan.svg)

**Orbital Finance** is a high-fidelity, multi-currency expense tracker designed for the digital nomad, the global citizen, and the crypto-native. Built with a focus on privacy, aesthetics, and real-time global valuation.

Unlike traditional finance apps that lock you into a single currency or boring spreadsheets, Orbital treats your finances as a global portfolio, seamlessly blending Fiat and Crypto assets into a unified "Net Worth" viewing experience calculated in your preferred global unit of account.

---

## ✨ Features

- **Multi-Wallet Architecture**: Create distinct vaults for different purposes (e.g., "Main Stash", "Travel Fund", "Cold Storage").
- **Hybrid Asset Support**: Native support for Fiat (USD, EUR, GBP, JPY) and Crypto (BTC, ETH, SOL) assets.
- **Global Unit of Account**: Instantly normalize your entire net worth into a single currency (e.g., View your BTC and JPY holdings in USD) using real-time exchange rates.
- **Privacy-First (Local)**: Data is stored locally in your browser. No external servers hold your financial data.
- **Orbit Key Auth**: Unique client-side credential generation (SHA-256) ensures only you can decrypt/access your local session.
- **Data Sovereignty**: Full JSON export and import capabilities.
- **Sci-Fi Aesthetic**: A "Void & Neon" design language featuring glassmorphism, micro-interactions, and fluid animations.

---

## 📸 Screenshots

### Overview
![Overview](/screenshots/overview.png)

### Exchange Rate
![Overview](/screenshots/exchannge-rates.png)

---

## 🛠 Tech Stack

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Motion**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Components**: Custom UI built on Headless primitives + [Vaul](https://emilkowal.ski/vaul) for drawers.
- **Data Persistence**: LocalStorage with Context API state management.
- **API**: [@fawazahmed0/currency-api](https://github.com/fawazahmed0/currency-api) for exchange rates.

---

## 🏗 Architecture

### State Management
The application utilizes a monolithic Context provider (`FinanceContext.tsx`) to manage global state. This ensures immediate consistency between wallets, transactions, and the exchange rate service.

### Authentication (`Orbital Identity`)
We do not use a traditional backend auth system. Instead, we use a **Local Deterministic Identity** model:
1. User provides a Username + Password.
2. `utils/crypto.ts` generates a SHA-256 hash ("Orbit Key").
3. This key acts as the index for retrieving encrypted-like data blobs from LocalStorage.

### Directory Structure
```
src/
├── components/       # Reusable UI components (Buttons, Modals, Sidebar)
├── context/         # Global State (FinanceContext)
├── pages/           # Route views (Dashboard, Wallets, Settings)
├── services/        # External API integrations (currencyService)
├── types/           # TypeScript interfaces
└── utils/           # Helper functions (crypto, formatting)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/orbital-finance.git
   cd orbital-finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

---

## 🤝 Contribution Guidelines

We welcome contributions from the community! Whether it's a bug fix, a new feature, or a design tweak, here is how you can help.

### 1. Issues & Discussions
*   **Check existing issues** before creating a new one.
*   Use the "Feature Request" or "Bug Report" templates.
*   Join the discussion on architecture decisions if you plan to refactor core context logic.

### 2. Development Workflow
1.  **Fork** the repository.
2.  Create a **feature branch**: `git checkout -b feature/amazing-feature`.
3.  **Commit** your changes: `git commit -m 'feat: add amazing feature'`.
4.  **Push** to the branch: `git push origin feature/amazing-feature`.
5.  Open a **Pull Request**.

### 3. Coding Standards
*   **TypeScript**: Strict mode is enabled. No `any` unless absolutely necessary.
*   **Styling**: Use Tailwind utility classes. Avoid inline styles.
*   **Components**: Keep components small and functional. Extract logic to hooks where possible.
*   **Aesthetics**: Respect the "Void" theme (Dark mode only). Use CSS variables defined in `index.html` configuration.

---

## 🗺 Roadmap

- [ ] **Backend Sync**: Optional integration with Drizzle ORM + Postgres for cross-device sync.
- [ ] **Budgeting**: Monthly caps per category with visual alerts.
- [ ] **More Chains**: Integration with live on-chain data for wallet balances.
- [x] **Visualizations**: Heatmaps for spending habits.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built for the citizens of the internet.* 🚀