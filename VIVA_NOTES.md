# Computer Science Exam Viva & Technical Defense Notes 🎓
## Project: Personal Finance Analyzer (AI/ML & Full-Stack System)

This guide provides deep-dive theoretical and practical explanations for external examiners, project reviewers, and viva voce defense.

---

## 1. System Architecture & High-Level Design

### Q: Why a decoupled Client-Server architecture instead of a monolith (e.g. Django templates or Flask-Jinja)?
- **Separation of Concerns**: The business and analytics logic reside exclusively in the FastAPI backend, while the presentation tier is managed in a responsive React SPA.
- **API-First Design**: The backend exposes standard RESTful JSON contracts (`/api/transactions`, `/api/analytics`, `/api/insights`), allowing future extensions (e.g. React Native mobile app, Telegram bot) without touching backend code.
- **Client-Side Rendering (CSR)**: Heavy chart rendering and reactive state management (dynamic category editing, multi-filtering, pagination, modal flows) execute on the client device without full-page reloads, saving bandwidth and server compute.

### Q: Why SQLite instead of PostgreSQL or MySQL?
- **Zero-Configuration & Portability**: SQLite is serverless and self-contained in a single file (`finance.db`). It requires no background database daemon or cloud credentials, making the project instantly runnable on any machine or evaluation environment.
- **Local Data Privacy**: Personal financial transaction logs and UPI histories contain sensitive PII (Personally Identifiable Information). An embedded local SQLite database guarantees zero data leakage to external third-party cloud database providers.
- **Performance Characteristics**: For single-user personal finance workloads (thousands to tens of thousands of transactions), SQLite performs faster than client-server DBMSs due to zero network socket latency.

---

## 2. Core Algorithms & Logic Specifications

### 2.1 CSV Parsing & Indian Currency Normalization
#### Algorithm:
1. **Auto-Column Detection**:
   - Matches header keywords against weighted dictionaries (`DATE_KEYWORDS`, `DESC_KEYWORDS`, `AMOUNT_KEYWORDS`, `DEBIT_KEYWORDS`, `CREDIT_KEYWORDS`).
   - Differentiates single-amount columns from split accounting columns (`Debit` vs `Credit`).
   - Distinguishes exact token matches (`cr`, `dr`) from substring matches to prevent false positives (e.g., preventing `"cr"` in `"description"` from falsely matching).
2. **Indian Number Format Parsing**:
   - Strips currency glyphs (`₹`, `Rs.`, `INR`), thousands commas (both Western standard `123,456.00` and Indian numbering system `1,23,456.00`), and spaces.
   - Handles accounting negative notation (e.g., `(450.00)` $\rightarrow$ `-450.00`).
3. **Idempotent Deduplication**:
   - Computes SHA-256 row hash:
     $$\text{RowHash} = \text{SHA256}(\text{date} + \text{"\_"} + \text{clean\_desc} + \text{"\_"} + \text{amount} + \text{"\_"} + \text{type})$$
   - If `RowHash` already exists in the database index, the row is safely skipped.

---

### 2.2 Categorization Engine & Feedback Learning Loop
#### Algorithm:
1. **Rule Priority Hierarchy**:
   - The system checks database rules ordered by `priority DESC` followed by `is_custom DESC`.
   - Custom user rules (priority 2) always override default system rules (priority 1).
2. **Feedback Learning Mechanism**:
   - When a user corrects a transaction's category in the UI (e.g. changing `"UPI-SWIGGY-123"` from `"Other"` to `"Food"`):
     1. The engine isolates the core keyword (`"SWIGGY"`).
     2. Upserts a custom rule in `category_rules` with `priority = 2` and `is_custom = True`.
     3. Triggers retroactive batch re-categorization:
        $$\text{UPDATE transactions SET category = new\_cat WHERE clean\_desc ILIKE \%keyword\%}$$
     4. Subsequent statement uploads matching `"SWIGGY"` are automatically categorized as `"Food"` without manual intervention.

---

### 2.3 Spending Anomaly & Outlier Detection
#### Algorithm:
The system combines **Statistical Z-Score** with **scikit-learn Isolation Forest**:

1. **Category-Specific Z-Score**:
   - For a given transaction amount $X$ in category $C$:
     $$\mu_C = \frac{1}{N}\sum_{i=1}^N X_i, \quad \sigma_C = \sqrt{\frac{1}{N}\sum_{i=1}^N (X_i - \mu_C)^2}$$
     $$Z = \frac{X - \mu_C}{\sigma_C}$$
   - If $Z > 2.5$ (exceeding 2.5 standard deviations above the mean), the transaction is flagged.
   - Generates natural language reasoning:
     $$\text{Multiplier} = \frac{X}{\mu_C} \quad \rightarrow \quad \text{"Amount ₹18,500 is 3.8x higher than your average Shopping expense of ₹4,800"}$$

2. **Isolation Forest Outlier Detection**:
   - An unsupervised tree-based algorithm that isolates anomalies by randomly partitioning feature values.
   - Anomalies require fewer recursive splits to isolate than normal cluster points, yielding shorter path lengths from the tree root:
     $$s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$$
   - Identifies non-linear multidimensional outliers across the overall spending distribution.

---

### 2.4 Periodic Recurring Subscription Detection
#### Algorithm:
1. **Merchant Grouping**: Group all debit transactions by normalized `clean_description`.
2. **Interval Calculation**: For merchants with $\ge 3$ transactions, calculate consecutive day deltas:
   $$\Delta t_i = \text{Date}_i - \text{Date}_{i-1}$$
3. **Variance Thresholding**:
   - Calculate mean interval $\overline{\Delta t}$ and standard deviation $\sigma_{\Delta t}$.
   - If $\sigma_{\Delta t} \le 10$ days:
     - $25 \le \overline{\Delta t} \le 35$ days $\rightarrow$ Classified as **Monthly** (e.g., Netflix, Rent, Broadband).
     - $5 \le \overline{\Delta t} \le 10$ days $\rightarrow$ Classified as **Weekly**.
4. **Next Due Date Estimation**:
   $$\text{NextDueDate} = \text{Date}_{\text{last}} + \text{round}(\overline{\Delta t})$$

---

### 2.5 Spending Forecasting Engine
#### Algorithm:
Blends **Weighted Moving Average (WMA)** with **Ordinary Least Squares (OLS) Linear Regression**:

1. **Weighted Moving Average**:
   - Gives highest weight to recent months while incorporating historical momentum:
     $$\hat{Y}_{\text{WMA}} = 0.5 \cdot Y_{t} + 0.3 \cdot Y_{t-1} + 0.2 \cdot Y_{t-2}$$
2. **Linear Regression Trend**:
   - Fits $y = \beta_1 X + \beta_0$ where $X = [0, 1, 2, \dots, T-1]$ (months).
   - Computes $R^2$ coefficient of determination as the confidence score:
     $$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$
3. **Adaptive Blending**:
   - Dynamically shifts weight toward Linear Regression when model confidence ($R^2$) is strong:
     $$\text{Weight}_{\text{LR}} = 0.4 + (0.2 \cdot R^2)$$
     $$\hat{Y}_{\text{Final}} = \text{Weight}_{\text{LR}} \cdot \hat{Y}_{\text{LR}} + (1 - \text{Weight}_{\text{LR}}) \cdot \hat{Y}_{\text{WMA}}$$
   - Enforces non-negative constraint: $\hat{Y} = \max(0, \hat{Y})$.

---

## 3. Database Schema & Normalization

### Tables & Relationships
1. **`transactions`**:
   - Stores individual debit/credit records.
   - Indexed fields: `date`, `category`, `type`, `row_hash`.
2. **`category_rules`**:
   - Keyword dictionary for auto-categorization. Unique constraint on `keyword`.
3. **`budgets`**:
   - Monthly category spending caps. Compound unique constraint on `(category, month_year)`.
4. **`categories`**:
   - Master list of supported financial categories.

---

## 4. Viva Voce Quick-Fire Answers

| Question | Core Technical Answer |
| :--- | :--- |
| **How does your system prevent duplicate uploads?** | Each transaction is assigned a SHA-256 hash computed from `(date, clean_description, amount, type)`. Duplicate rows are rejected via a unique constraint in SQLite. |
| **Why FastAPI over Flask?** | FastAPI uses asynchronous non-blocking I/O (`asyncio`), automatic OpenAPI/Swagger documentation generation, and native type-validation via Pydantic v2. |
| **How does feedback learning work without heavy model re-training?** | It uses an adaptive rule engine with priority hierarchies. User edits generate high-priority keyword rules that immediately take precedence and trigger immediate bulk updates. |
| **What happens if a bank CSV has different column headers?** | The system provides an interactive column-mapping modal. It auto-detects standard columns while allowing users to override date, description, and amount columns. |
| **How is Indian currency formatted?** | Numbers are formatted in the Indian numbering system using `Intl.NumberFormat('en-IN')` (e.g., Lakhs and Crores grouping: `1,23,456.00`). |
