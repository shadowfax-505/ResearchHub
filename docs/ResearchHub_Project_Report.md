# ResearchHub — Project Report
Database Lab Course Project Showcase

## Table of Contents
1. Executive Summary
2. System Architecture & Technology Stack
3. Database Architecture
   3.1 Conceptual Entity–Relationship Diagram (Schema Guide)
   3.2 Physical Database Schema Diagram
4. Advanced PL/SQL Business Logic Layer
   4.1 Profile Management Package (`PKG_PROFILE`)
   4.2 Moderation Engine Package (`PKG_MODERATION`)
   4.3 Admin Operations & Analytics (`PKG_ADMIN`)
5. Authentication & Identity Management
   5.1 Registration
   5.2 Login
   5.3 E-mail Verification
   5.4 Password Reset
6. Research Paper Management
   6.1 CRUD Operations
   6.2 Author Attachment & Relational Integrity
7. Job Board & Academic Careers
   7.1 Job CRUD & Filtering
   7.2 Faceted Search Aggregation
8. Provider-Agnostic Universal Search
   8.1 Oracle Text Full-Text Search
   8.2 Dynamic Filter Application
9. Q&A and Academic Networking
   9.1 Question & Answer Forum
   9.2 Direct Messaging
   9.3 Discovery Feed & Notifications
10. Security, Authorization & Validation

---

## 1. Executive Summary
ResearchHub is a full-stack, production-grade academic resource planning and research management web application. It centralizes every stage of academic workflow—from managing research papers and author profiles, to filtering academic job postings, to transparent peer review and network analytics.

Built primarily to showcase deep database concepts for a Database Lab Course, the platform offloads complex business mutations and data aggregation to an advanced Oracle PL/SQL layer. It uses role-based views to expose only the information each audience is permitted to see.

**Key headline figures:**
- **Controllers**: 28+
- **Database Tables**: 30+ 
- **PL/SQL Packages**: 3 Core business logic packages
- **API Endpoints**: ~120 named routes

---

## 2. System Architecture & Technology Stack
ResearchHub is a modular monolith following MVC (Model-View-Controller) on the backend and a modern reactive component tree on the frontend, enforcing SOLID principles throughout.

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Node.js + Express | Core MVC framework, routing, middleware |
| **Database** | Oracle Database | High-performance RDBMS, Oracle Text search, PL/SQL |
| **Authentication** | Custom JWT + Bcrypt | Session auth, hashing, e-mail verification |
| **Frontend** | React (Next.js) + Tailwind CSS | Server-rendered templates, utility-first styling |
| **Code Quality** | ESLint & Prettier | Code style enforcement |

### Directory Layout (Abridged)
```text
project/
  api/src/
    controllers/     ← Backend business logic controllers (28+)
    models/          ← Database interaction layer & raw SQL (30+)
    routes/          ← Express route definitions
    middleware/      ← JWT auth and validation middleware
    config/          ← Oracle DB connection pools
  web/app/
    login/           ← React login components
    signup/          ← React registration components
    papers/          ← Research paper listing & details
    jobs/            ← Job board views
  database/migrations/ ← SQL migration files & PL/SQL package definitions
```

---

## 3. Database Architecture
The database design is presented at two complementary levels: a conceptual entity–relationship view of the business domain and a physical schema view of the principal implementation tables.

### 3.1 Conceptual Entity–Relationship Diagram (Schema Guide)
This section outlines the exact entities and relationships to accurately generate the ER diagram for the academic domain.

#### Core Entities:
1. **User**: Represents a registered account (e.g., researcher, admin).
2. **Author**: Represents a verified author identity (often linked to a User via claims).
3. **Paper**: Represents a published academic research document.
4. **Journal**: The publication where a paper is submitted.
5. **Job**: An academic or research-based employment opportunity.
6. **Institution**: The organization providing the job or affiliation.
7. **Question / Answer**: Entities for the academic Q&A forum.
8. **Message**: Direct communications between users.

#### Key Cardinality & Relationships:
- **User (1) ↔ (M) User**: Self-referencing Many-to-Many relationship mapping followers/following via the `USER_FOLLOWS` associative table.
- **User (1) ↔ (M) Author**: A User can claim multiple author identities (e.g., aliases or variations) via `USER_AUTHOR_CLAIMS`.
- **User (1) ↔ (1) Researcher_Stats**: One-to-One mapping tracking aggregate statistics (RG Score, total reads).
- **Paper (M) ↔ (N) Author**: A paper has multiple authors, and an author has multiple papers. Resolved via the `PAPER_AUTHORS` associative table, which stores the `author_order`.
- **Paper (M) ↔ (N) User (Saves)**: Users bookmarking papers, resolved via `SAVED_PAPERS`.
- **Journal (1) ↔ (M) Paper**: A journal publishes multiple papers.
- **Institution (1) ↔ (M) Job**: Institutions post multiple roles.
- **User (1) ↔ (M) Job**: A specific User is marked as the poster of multiple jobs.
- **User (1) ↔ (M) Question / Answer**: A user posts multiple questions or answers.
- **Question (1) ↔ (M) Answer**: A single question can have multiple answers.

*(Add Conceptual ER Diagram image here based on the constraints above)*
> **[Screenshot: Conceptual ER Diagram]**

### 3.2 Physical Database Schema Diagram
*Implementation: [`api/src/models/User.js: L5-L25`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/models/User.js#L5-L25) | [`api/src/models/Paper.js: L12-L35`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/models/Paper.js#L12-L35)*
The physical schema implements strict referential integrity, indexing, and appropriate data types. Below are the key implementation tables:

- **USERS**: `user_id` (PK, Number), `username` (Varchar, UQ), `email` (Varchar, UQ), `password_hash`, `is_verified` (Number/Bool).
- **RESEARCH_PAPERS**: `paper_id` (PK, Number), `journal_id` (FK), `title` (Varchar), `abstract` (Clob), `publication_date` (Date), `citation_count`, `view_count` (Number).
- **AUTHORS**: `author_id` (PK, Number), `full_name`, `affiliation`, `orcid` (Varchar).
- **JOBS**: `job_id` (PK, Number), `employer`, `title`, `location`, `posted_at` (Timestamp).
- **USER_FOLLOWS**: `follower_user_id` (FK), `followed_user_id` (FK) - Composite PK.
- **QUESTIONS**: `question_id` (PK), `user_id` (FK), `title`, `body` (Clob).

*(Add Physical Schema diagram image here)*
> **[Screenshot: Physical Schema Diagram]**

---

## 4. Application of Core Database Concepts (PL/SQL Layer)
To ensure data integrity, atomicity, and performance, critical business operations are pushed down to the database using Oracle PL/SQL packages. This acts as a practical implementation of advanced database concepts taught in the Database Lab.

### 4.1 Relational JOIN Operations in Practice
*Implementation: [`database/migrations/20260713_add_social_platform.sql: L278-L290`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260713_add_social_platform.sql#L278-L290)*
The system heavily relies on various types of `JOIN` operations to reconstruct normalized data into meaningful views:
- **INNER JOIN**: Used strictly when relationships must exist. For example, fetching a user's verified papers requires `JOIN PAPER_AUTHORS pa` and `JOIN USER_AUTHOR_CLAIMS c` where `c.status = 'verified'`.
- **LEFT (OUTER) JOIN**: Used for optional data. In `PKG_PROFILE.get_public_profile`, a `LEFT JOIN RESEARCHER_STATS` is used because a newly registered user might not have an aggregated statistics record generated yet, preventing the entire profile query from failing.

### 4.2 Application of Oracle Functions
*Implementation: [`api/src/models/User.js: L80`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/models/User.js#L80) | [`database/migrations/20260710_add_social_admin_packages.sql: L320`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260710_add_social_admin_packages.sql#L320)*
The PL/SQL layer avoids reinventing the wheel by maximizing the use of built-in Oracle functions:
- **String Manipulation**: `LOWER(TRIM(p_slug))` ensures case-insensitive, whitespace-safe URL routing.
- **Null Coalescing (`NVL`)**: `NVL(rs.followers, 0)` is used extensively in mathematical operations to prevent `NULL` propagation when calculating the RG Score.
- **Native JSON Generation**: Functions like `JSON_ARRAYAGG` and `JSON_OBJECT` are used to natively convert relational rows (like a user's Education history) into nested JSON structures directly inside the database, offloading serialization from the Node.js server.
- **Window Functions**: `ROW_NUMBER() OVER(ORDER BY ...)` is utilized in the discovery feed CTEs for advanced cursor-based pagination.

### 4.3 Triggers vs. Stored Procedure Encapsulation
*Implementation: [`database/migrations/20260710_add_social_admin_packages.sql: L307-L339`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260710_add_social_admin_packages.sql#L307-L339)*
While traditional database designs might use `AFTER INSERT OR UPDATE` triggers to maintain the `updated_at` column or calculate aggregate stats, this project centralizes that mutation logic inside PL/SQL Stored Procedures (`PKG_ADMIN.refresh_researcher_stats`). 
This design choice was made to avoid the "hidden side-effects" often caused by complex cascading triggers. By using Explicit Procedures and `MERGE INTO` (Upsert) statements instead of Triggers, the execution flow remains predictable, testable, and easier to debug, demonstrating an understanding of trade-offs in modern database architecture.

### 4.4 Profile Management Package (`PKG_PROFILE`)
*Implementation: [`database/migrations/20260713_add_social_platform.sql: L271-L312`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260713_add_social_platform.sql#L271-L312)*
Handles complex relational data aggregation for researcher profiles.
- **`get_public_profile`**: Uses `SYS_REFCURSOR` to return multiple result sets in a single database round-trip (Profile data, Papers, and Questions).
- **JSON Aggregation**: Utilizes `JSON_ARRAYAGG` and `JSON_OBJECT` directly in SQL to serialize sub-entities (Education, Experience, Skills) natively.
  ```sql
  (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
       'education_id' VALUE e.education_id, 'institution' VALUE e.institution, 
       'degree' VALUE e.degree, 'field_of_study' VALUE e.field_of_study
  )), '[]') FROM USER_EDUCATION e WHERE e.user_id = u.user_id) as education_json
  ```
> **[Screenshot: Researcher Public Profile view]**
> **[Screenshot: Profile Edit Form (Education & Skills)]**

### 4.5 Moderation Engine Package (`PKG_MODERATION`)
*Implementation: [`database/migrations/20260710_add_social_admin_packages.sql: L175-L247`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260710_add_social_admin_packages.sql#L175-L247)*
Manages the lifecycle of user-reported content (papers, users, reviews, questions).
- **`apply_action`**: Uses `EXECUTE IMMEDIATE` to dynamically generate SQL statements based on the `target_type` being moderated. 
- Captures pre- and post-mutation JSON state snapshots for strict auditing (`before_state`, `after_state`).

> **[Screenshot: Admin Moderation Queue dashboard]**
> **[Screenshot: Content Report Submission Dialog]**

### 4.6 Admin Operations & Analytics (`PKG_ADMIN`)
*Implementation: [`database/migrations/20260710_add_social_admin_packages.sql: L307-L339`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260710_add_social_admin_packages.sql#L307-L339)*
Responsible for sensitive state changes and complex statistical rollups.
- **`refresh_researcher_stats`**: Uses the `MERGE INTO` statement to calculate and upsert a researcher's `rg_score` by evaluating their activity across 7 different tables atomically.

> **[Screenshot: Admin System Analytics Dashboard]**

### 4.7 PL/SQL Exception Handling & Custom Errors
Rather than relying purely on the Node.js application to enforce business rules, ResearchHub leverages strict Oracle Exception Handling. The packages use `RAISE_APPLICATION_ERROR` to generate custom error codes (e.g., `-20004` to prevent a user from following themselves, or `-20102` for unauthorized moderator actions). This ensures the database maintains absolute sovereign authority over data integrity.

### 4.8 Complex Data Aggregation (RG Score Engine)
*Implementation: [`database/migrations/20260710_add_social_admin_packages.sql: L307-L339`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260710_add_social_admin_packages.sql#L307-L339)*
The `PKG_ADMIN.refresh_researcher_stats` procedure acts as the engine for calculating a user's "RG Score" (ResearchHub Activity Score). It performs massive data aggregation by simultaneously querying 8 independent tables:
- `SAVED_PAPERS` (Bookmarks)
- `USER_FOLLOWS` (Followers / Following)
- `REVIEWS` (Published peer reviews)
- `QUESTIONS` & `ANSWERS` (Forum participation)
- `EMAIL_QUEUE` (Full-text requests)
- `USER_ACTIVITY` (Total profile/paper reads)

Instead of executing 8 separate queries in Express.js, the database compiles these metrics internally and uses a `MERGE INTO RESEARCHER_STATS` statement to perform an atomic "UPSERT" (Update if exists, Insert if new) of the researcher's global score.

---

## 5. Authentication & Identity Management
ResearchHub uses custom JWT middleware paired with Joi validation to provide a complete authentication scaffold.

### 5.1 Registration
*Implementation: [`api/src/controllers/UserController.js: L79-L119`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/UserController.js#L79-L119)*
Users register at `/signup`. The `UserController` validates the input schema, creates the `User` model with a Bcrypt-hashed password, issues an email verification token into `AuthToken`, and logs them in.

> **[Screenshot: User Registration interface]**

### 5.2 Login
*Implementation: [`api/src/controllers/UserController.js: L147-L174`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/UserController.js#L147-L174)*
The `UserController@login` method delegates to `User.findByIdentifier()` (supporting both username and email) and verifies the hash via `bcrypt.compare`.

> **[Screenshot: Secure Login interface]**

### 5.3 E-mail Verification
*Implementation: [`api/src/controllers/UserController.js: L268-L290`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/UserController.js#L268-L290)*
Users must verify their e-mail address before accessing certain features. This prevents spam and ensures communication validity.

### 5.4 Password Reset
*Implementation: [`api/src/controllers/UserController.js: L315-L328`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/UserController.js#L315-L328)*
Secure hex token validation flow preventing brute force attempts.

> **[Screenshot: Password Reset Flow]**

---

## 6. Research Paper Management
Papers are the central entity of ResearchHub. Each paper belongs to a journal, has multiple authors, a category, and rich text fields.

### 6.1 CRUD Operations
*Implementation: [`api/src/controllers/PaperController.js: L227-L255`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/PaperController.js#L227-L255)*
- **Paper Model Search Query** implements a dynamic fallback mechanism if the Oracle Text index throws `ORA-20000`.

> **[Screenshot: Research Paper Dashboard/Search]**
> **[Screenshot: Paper Detail View (Abstract & Authors)]**
> **[Screenshot: Paper Upload / Creation Form]**

### 6.2 Author Attachment & Relational Integrity
*Implementation: [`api/src/controllers/PaperController.js: L42`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/PaperController.js#L42)*
Authors are dynamically linked to papers. If an author doesn't exist, they are generated dynamically. The platform merges identical claims using `MERGE INTO USER_AUTHOR_CLAIMS target USING (...)`.

---

## 7. Job Board & Academic Careers
The Job Board allows institutions to post roles and tracks complex relational metrics for filtering.

### 7.1 Job CRUD & Filtering
*Implementation: [`api/src/models/Job.js: L16-L44`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/models/Job.js#L16-L44)*
- **Dynamic WHERE Builder**: Automatically parses arrays into parameterized `IN (?, ?)` clauses to prevent SQL injection.

> **[Screenshot: Job Listings view]**
> **[Screenshot: Job Posting Details & Apply Panel]**

### 7.2 Faceted Search Aggregation
*Implementation: [`api/src/models/Job.js: L70-L75`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/models/Job.js#L70-L75)*
Provides live counts of jobs by country, discipline, and employment mode using efficient `GROUP BY` counts:
```sql
SELECT country name, COUNT(*) count FROM JOBS GROUP BY country ORDER BY count DESC
```

> **[Screenshot: Job Filter Aggregation Sidebar]**

---

## 8. Provider-Agnostic Universal Search
Search powers discoverability across papers and authors.

### 8.1 Oracle Text Full-Text Search
*Implementation: [`api/src/models/Paper.js: L66`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/models/Paper.js#L66)*
For massive text datasets (abstracts), standard `LIKE` operators are too slow. ResearchHub implements `Oracle Text`.
- **Query Syntax**: `CONTAINS(p.title, ?, 1) > 0 OR CONTAINS(p.abstract, ?, 2) > 0`
- **Exception Handling**: Automatically falls back to standard `LIKE LOWER(?)` if the index is unreachable.

> **[Screenshot: Universal Search Interface / Results]**

---

## 9. Q&A and Academic Networking
The platform facilitates community engagement via a robust messaging and discussion framework.

### 9.1 Question & Answer Forum
*Implementation: [`api/src/controllers/QuestionController.js: L16-L120`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/QuestionController.js#L16-L120)*
Users can post academic inquiries, categorized by discipline, and receive peer-reviewed answers.
- `QuestionController` and `AnswerController` map to standard CRUD routes, managing view counts and voting scores.

> **[Screenshot: Q&A Forum Feed]**
> **[Screenshot: Question Detail with Answer Thread]**

### 9.2 Direct Messaging
*Implementation: [`api/src/controllers/MessageController.js: L15-L85`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/MessageController.js#L15-L85)*
Researchers can network via 1-to-1 direct messaging, governed by the `MessageController`.

> **[Screenshot: Direct Messaging Interface / Inbox]**

### 9.3 Discovery Feed & Notifications
*Implementation: [`api/src/controllers/NotificationController.js: L12-L65`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/NotificationController.js#L12-L65)*
A personalized activity feed recommending papers based on `FOLLOWED_AUTHORS` and `USER_INTERESTS`. Real-time updates populate the `NOTIFICATIONS` table.

> **[Screenshot: Personalized Discovery Feed]**
> **[Screenshot: Notification Dropdown Panel]**

### 9.4 Discovery Feed Scoring Algorithm (`PKG_DISCOVERY`)
*Implementation: [`database/migrations/20260713_add_discovery_feed.sql: L110-L229`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260713_add_discovery_feed.sql#L110-L229)*
The personalized feed is generated using a highly complex PL/SQL procedure `PKG_DISCOVERY.get_feed`. Instead of executing massive joins in the application layer, the database calculates a real-time `feed_priority` using Common Table Expressions (CTEs):
1. **Priority 3 (Highest)**: Papers by researchers the user follows via `USER_FOLLOWS`.
2. **Priority 2**: Papers by specific authors the user follows via `FOLLOWED_AUTHORS`.
3. **Priority 1**: Papers matching the user's explicit or inferred interests (matching `PAPER_FIELDS`, `PAPER_KEYWORDS`, or `JOURNALS`) via `USER_INTERESTS`.
4. **Pagination**: The stored procedure implements advanced cursor-based pagination using `ROW_NUMBER() OVER (...)` filtering by `p_before_date` and `p_before_priority` for seamless infinite scrolling on the frontend.

### 9.5 Network Recommendation Engine (`PKG_NETWORK`)
*Implementation: [`database/migrations/20260713_add_social_platform.sql: L380-L400`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260713_add_social_platform.sql#L380-L400)*
To suggest researchers to follow, ResearchHub uses a complex heuristic algorithm built entirely in PL/SQL (`PKG_NETWORK.get_recommendations`). It assigns weighted scores based on relational overlaps, skipping blocked users:
- **Shared Field**: +3 points per shared academic discipline.
- **Same Institution**: +4 points for matching university/affiliation strings.
- **Co-authorship**: +2 points per jointly published paper.
- **Mutual Followers**: +1 point for each shared connection.
The database calculates the highest matching condition dynamically and returns a specific `recommendation_reason` (e.g., `'same_institution'`, `'coauthor'`, `'shared_field'`) so the frontend can display contextual suggestions (e.g., "Because you both researched at MIT").

> **[Screenshot: People You May Know / Network Suggestions]**

---

## 10. Security, Authorization & Validation

### 10.1 Role-Based Access Control (RBAC)
*Implementation: [`database/migrations/20260710_add_social_admin_foundation.sql: L90-L110`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260710_add_social_admin_foundation.sql#L90-L110)*
The database schema implements a normalized Role-Based Access Control (RBAC) system:
- **`ROLE_DEFINITIONS`**: Defines roles like `researcher`, `student`, `librarian`, `moderator`, and `admin`.
- **`PERMISSION_DEFINITIONS`**: Defines granular capabilities like `profile.manage`, `content.moderate`, `users.manage`, and `roles.manage`.
- **`ROLE_PERMISSIONS` & `USER_ROLE_ASSIGNMENTS`**: Maps users to roles and roles to permissions.
The backend middleware intercepts API requests and verifies these assigned permissions before querying the database, ensuring zero-trust execution.

### 10.2 System-Level Defenses
*Implementation: [`api/src/config/database.js: L64-L81`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/config/database.js#L64-L81) | [`api/src/controllers/UserController.js: L22-L35`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/controllers/UserController.js#L22-L35)*
| Concern | Implementation |
|---------|----------------|
| **Authentication** | JWT-based auth stored securely in HttpOnly cookies |
| **Input Validation** | Strict `Joi` validation schemas for every mutation |
| **Password Hashing** | Bcrypt with salt rounds (`bcrypt.hash(val, 10)`) |
| **SQL Injection** | 100% Parameterized queries (`pool.query(sql, params)`) |
| **Duplicate Checking** | Unique constraint error catching (`ORA-00001`) |

---

## 11. Database Optimization & Performance Tuning
To ensure the application remains highly performant and scales efficiently under load, several optimization strategies are implemented strictly at the database tier.

### 11.1 Indexing Strategies & Composite Indexes
*Implementation: [`database/migrations/20260710_add_social_admin_foundation.sql: L260`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260710_add_social_admin_foundation.sql#L260)*
Instead of relying on full table scans for dashboard queries, the system uses highly targeted B-Tree indexes. For complex dashboards like the Moderation Admin Queue, **Composite Indexes** are utilized to match the exact `WHERE` clause filters in the application layer.

```sql
-- Composite index optimizing the admin moderation queue dashboard
CREATE INDEX idx_moderation_cases_queue 
ON MODERATION_CASES (status, priority, created_at);
```
> *Performance Context*: The order of columns in the composite index is critical. By placing high-cardinality filters like `status` and `priority` first, the database engine can immediately discard irrelevant cases before sorting by `created_at`, reducing I/O disk reads drastically.

### 11.2 Oracle Text Indexing (Domain Indexes)
*Implementation: [`api/src/models/Paper.js: L66`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/models/Paper.js#L66)*
Standard RDBMS indexes (B-Tree/Bitmap) cannot efficiently search within large blocks of text (like research abstracts). To solve this, a Domain Index is created via `CTXSYS.CONTEXT`. 
This creates an inverted index, tokenizing all words in the abstract, allowing the application to execute `CONTAINS(p.abstract, 'machine learning', 1) > 0` which resolves in milliseconds rather than the seconds required for a `LIKE '%machine learning%'` scan.

### 11.3 Query Execution Plan Optimization (CTEs)
*Implementation: [`database/migrations/20260713_add_discovery_feed.sql: L110-L229`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260713_add_discovery_feed.sql#L110-L229)*
When building the Discovery Feed, joining the `PAPERS`, `AUTHORS`, `USER_FOLLOWS`, and `USER_INTERESTS` tables simultaneously would result in a massive Cartesian product, blowing up the temporary tablespace memory in the Execution Plan. 
To optimize the execution plan, the `PKG_DISCOVERY.get_feed` procedure uses **Common Table Expressions (CTEs)**. It first aggressively filters down the pool of matching papers *before* joining them to the heavy metadata tables. This ensures the database optimizer's memory consumption remains extremely lean regardless of how large the underlying tables grow.

---

## 12. Database Seeding & Mock Data Generation
To populate the massive Oracle RDBMS with realistic academic data for presentation, the project utilizes several Node.js seed scripts that bypass standard APIs to rapidly inject bulk records using programmatic generation.

### 12.1 Automated Setup (`package.json`)
*Implementation: [`api/package.json: L13-L16`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/package.json#L13-L16)*
The database can be fully reset and seeded using the `npm run setup` automation hook, which strings together the `migrate` and `seed` commands seamlessly.

### 12.2 Bulk Faker Data Engine (`seed-additional.js`)
*Implementation: [`api/scripts/seed-additional.js: L14-L203`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/scripts/seed-additional.js#L14-L203)*
To rigorously test the database aggregation functions, a bulk data engine uses `faker.js` to dynamically generate thousands of synthetic rows. It intelligently seeds `RESEARCH_FIELDS`, `KEYWORDS`, and complex associative tracking tables like `PAPER_KEYWORDS`, proving that the relational mapping holds up under volume.

### 12.3 Dynamic Social Network Seeding (`seed-demo-network.js`)
*Implementation: [`api/scripts/seed-demo-network.js: L131-L135`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/scripts/seed-demo-network.js#L131-L135)*
Testing the `PKG_NETWORK.get_recommendations` algorithm requires highly specific intersectional data (users who share fields, institutions, and mutual followers). This dedicated script programmatically forces these intersections (co-authorship ties, follow loops) so the recommendation heuristics can be accurately demonstrated during grading.

---

## 13. Edge-Case Database Logic & Application Integration
This section highlights the most complex "bridge" concepts between the Oracle backend and the Express.js API, showcasing how edge cases are securely managed.

### 13.1 Dynamic SQL Execution (`EXECUTE IMMEDIATE`)
*Implementation: [`database/migrations/20260710_add_social_admin_packages.sql: L217-L234`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260710_add_social_admin_packages.sql#L217-L234)*
Instead of writing three separate stored procedures to moderate Papers, Users, and Jobs, the `PKG_MODERATION.apply_action` procedure relies on Oracle's `EXECUTE IMMEDIATE`. It dynamically concatenates the target table name and Primary Key at runtime, safely parsing the generic "target type" (e.g., `'PAPER'`) into a highly specific update query.

### 13.2 Connection Pooling & Node.js Scaling
*Implementation: [`api/src/config/database.js: L50-L62`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/config/database.js#L50-L62)*
To prevent the Express server from exhausting Oracle's socket connections during high load, connection pooling is explicitly enforced (`poolMin: 1, poolMax: 10`). This ensures connections are leased and released asynchronously, demonstrating an understanding of mid-tier database scaling beyond simple 1-to-1 persistent connections.

### 13.3 `SYS_REFCURSOR` Draining in Express
*Implementation: [`api/src/config/database.js: L96-L112`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/api/src/config/database.js#L96-L112)*
When the PL/SQL Profile package returns multiple record sets via `SYS_REFCURSOR`, fetching them directly into V8 memory could cause Node.js to throw a `heap out of memory` exception. To prevent this, the database adapter explicitly implements a draining loop (`value.getRows(BATCH)`) to pull 200 rows at a time until the Oracle cursor is fully exhausted.

---

## 14. Core Database Theory Implementation (Triggers & Functions)
To satisfy the strictest academic database requirements, specific schema-level logic has been embedded directly into Oracle using Triggers and Functions. These ensure data integrity independent of the application layer.

### 14.1 Audit Logging via Triggers
*Implementation: [`database/migrations/20260719_add_academic_triggers.sql: L10-L33`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260719_add_academic_triggers.sql#L10-L33)*
An `AFTER INSERT` trigger (`TRG_AUDIT_MODERATION`) is attached to the `MODERATION_ACTIONS` table. Whenever a moderator takes action against a user or paper, the trigger silently intercepts the event and writes a secondary record into the `MODERATION_AUDIT_LOG` table. This creates a highly secure paper-trail that cannot be bypassed by the Node.js API.

### 14.2 Business Rule Enforcement (Preventing Self-Follows)
*Implementation: [`database/migrations/20260719_add_academic_triggers.sql: L35-L45`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260719_add_academic_triggers.sql#L35-L45)*
A `BEFORE INSERT` trigger (`TRG_PREVENT_SELF_FOLLOW`) is attached to the `USER_FOLLOWS` table. If the `follower_id` matches the `following_id`, the trigger actively halts the transaction using `RAISE_APPLICATION_ERROR(-20001)`. This guarantees a user can never artificially inflate their network metrics, acting as a foolproof safety net.

### 14.3 Data Normalization Triggers
*Implementation: [`database/migrations/20260719_add_academic_triggers.sql: L47-L57`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260719_add_academic_triggers.sql#L47-L57)*
A `BEFORE INSERT OR UPDATE` trigger (`TRG_FORMAT_USER_SLUG`) ensures that every URL slug stored in the `RESEARCHER_PROFILES` table is forced into `LOWER(TRIM(:NEW.slug))`. This normalizes user input natively at the database level.

### 14.4 Complex PL/SQL Function
*Implementation: [`database/migrations/20260719_add_academic_triggers.sql: L59-L97`](file:///Users/muttakinrahman/Database%20Project/ResearchHub/project/database/migrations/20260719_add_academic_triggers.sql#L59-L97)*
A standalone PL/SQL Function, `FN_CALCULATE_PROFILE_COMPLETION(p_user_id)`, dynamically calculates a numeric percentage (0 to 100) based on how many profile fields a researcher has populated (headline, department, website, ORCID). Unlike procedures, this Function specifies a `RETURN NUMBER` type, allowing it to be injected directly into standard `SELECT` statements (e.g., `SELECT username, FN_CALCULATE_PROFILE_COMPLETION(user_id) FROM USERS`).
