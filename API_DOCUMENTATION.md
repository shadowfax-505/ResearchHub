# ResearchHub API Documentation

## Overview
The ResearchHub API provides RESTful endpoints for accessing and managing academic research papers, authors, journals, and more. Built with Express.js and Oracle Database, it supports full-text search, filtering, sorting, and analytics.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "data": {},
  "error": "error message if applicable",
  "pagination": { "limit": 20, "offset": 0, "total": 100 }
}
```

---

## Endpoints

### Users

#### Register User
```
POST /users/register
Content-Type: application/json

{
  "username": "researcher123",
  "email": "user@example.com",
  "password": "secure_password_min_8_chars",
  "full_name": "John Researcher",
  "affiliation": "Harvard University",
  "country": "United States"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": { "user_id": 1, "username": "researcher123" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```
POST /users/login
Content-Type: application/json

{
  "username": "researcher123",
  "password": "secure_password_min_8_chars"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": { "user_id": 1, "username": "researcher123", "role": "researcher" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get All Users
```
GET /users?limit=20&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "username": "researcher123",
      "email": "user@example.com",
      "full_name": "John Researcher",
      "role": "researcher",
      "affiliation": "Harvard University",
      "country": "United States",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { "limit": 20, "offset": 0, "total": 50 }
}
```

#### Get User by ID
```
GET /users/:userId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "researcher123",
    "email": "user@example.com",
    "full_name": "John Researcher",
    "affiliation": "Harvard University",
    "country": "United States",
    "bio": "AI researcher with focus on NLP",
    "is_active": true,
    "last_login": "2024-01-20T14:22:00Z",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-18T09:15:00Z"
  }
}
```

#### Update User
```
PUT /users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Researcher Updated",
  "affiliation": "MIT",
  "country": "United States",
  "bio": "AI researcher at MIT"
}

Response: 200 OK
```

#### Delete User
```
DELETE /users/:userId
Authorization: Bearer <token>

Response: 200 OK
```

#### User Statistics
```
GET /users/stats
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "total": 50,
    "active": 42
  }
}
```

#### Get My Stats
```
GET /users/me/stats
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "saved_papers": 12,
    "following": 8,
    "followers": 24,
    "reviews": 3
  }
}
```

---

### Papers

#### Search Papers
```
GET /papers/search?query=machine+learning&field_id=1&year=2023&journal_id=5&limit=20&offset=0
Authorization: Optional

Query Parameters:
  - query (required): Search terms (title, abstract, keywords)
  - field_id (optional): Filter by research field ID
  - year (optional): Filter by publication year
  - journal_id (optional): Filter by journal ID
  - limit (optional): Results per page (default: 20, max: 100)
  - offset (optional): Pagination offset (default: 0)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "paper_id": 1,
      "title": "Deep Learning for Natural Language Processing",
      "abstract": "...",
      "doi": "10.1234/example",
      "publication_date": "2023-05-15",
      "journal_name": "Nature Machine Intelligence",
      "citation_count": 156,
      "view_count": 5423,
      "download_count": 1203,
      "volume": "5",
      "issue": "3",
      "pages": "234-256"
    }
  ],
  "query": "machine learning",
  "pagination": { "limit": 20, "offset": 0 }
}
```

#### Get Paper by ID
```
GET /papers/:paperId
Authorization: Optional

Response: 200 OK (view count incremented)
{
  "success": true,
  "data": {
    "paper_id": 1,
    "title": "Deep Learning for Natural Language Processing",
    "abstract": "...",
    "doi": "10.1234/example",
    "publication_date": "2023-05-15",
    "authors": [
      {
        "author_id": 1,
        "full_name": "Dr. Jane Smith",
        "affiliation": "Stanford University",
        "h_index": 45
      }
    ],
    "keywords": [
      { "keyword_id": 1, "keyword": "deep learning" },
      { "keyword_id": 2, "keyword": "NLP" }
    ],
    "fields": [
      {
        "field_id": 1,
        "field_name": "Computer Science",
        "relevance_score": 0.95
      }
    ]
  }
}
```

#### Request Full Text
```
POST /papers/:paperId/request-fulltext
Authorization: Bearer <token>

Response: 201 Created
{
  "success": true,
  "message": "Full-text request queued",
  "data": {
    "email_id": 42,
    "recipient_email": "author@example.com",
    "paper_id": 1
  }
}
```

#### Get Top Cited Papers
```
GET /papers/top-cited?limit=10
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "paper_id": 1,
      "title": "Deep Learning for Natural Language Processing",
      "abstract": "Full abstract text...",
      "journal_name": "Nature Machine Intelligence",
      "citation_count": 5423,
      "publication_date": "2023-05-15",
      "view_count": 45230
    }
  ],
  "count": 10
}
```

#### Get Trending Papers
```
GET /papers/trending?days=30&limit=10
Authorization: Optional

Query Parameters:
  - days (optional): Lookback period in days (default: 30)
  - limit (optional): Number of results (default: 10)

Response: 200 OK
```

#### Get Trending Fields
```
GET /papers/trending-fields
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "field_id": 1,
      "field_name": "Machine Learning",
      "paper_count": 124
    }
  ]
}
```

#### Create Paper
```
POST /papers
Authorization: Bearer <token> (researcher or admin only)
Content-Type: application/json

{
  "journal_id": 5,
  "title": "New Research Paper",
  "abstract": "Abstract text...",
  "doi": "10.1234/newpaper",
  "publication_date": "2024-01-15",
  "volume": "6",
  "issue": "1",
  "pages": "100-120",
  "language": "en",
  "is_peer_reviewed": true
}

Response: 201 Created
{
  "success": true,
  "message": "Paper created successfully",
  "data": { "paper_id": 123 }
}
```

#### Paper Statistics
```
GET /papers/stats
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": {
    "total_papers": 1500,
    "avg_citations": 45.2,
    "max_citations": 5423,
    "total_views": 250000
  }
}
```

---

### Authors

#### Get All Authors
```
GET /authors?limit=20&offset=0
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "author_id": 1,
      "full_name": "Dr. Jane Smith",
      "affiliation": "Stanford University",
      "country": "United States",
      "h_index": 45,
      "email": "jane@stanford.edu",
      "researcher_url": "https://researcher.com/jane-smith",
      "biography": "AI researcher specializing in NLP"
    }
  ],
  "pagination": { "limit": 20, "offset": 0, "total": 500 }
}
```

#### Get Author by ID
```
GET /authors/:authorId
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": {
    "author_id": 1,
    "full_name": "Dr. Jane Smith",
    "affiliation": "Stanford University",
    "country": "United States",
    "h_index": 45,
    "papers": [
      {
        "paper_id": 1,
        "title": "...",
        "citation_count": 156
      }
    ]
  }
}
```

#### Search Authors
```
GET /authors/search?q=smith&limit=20&offset=0
Authorization: Optional

Response: 200 OK
```

#### Get Top Authors
```
GET /authors/top?limit=10
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "author_id": 1,
      "full_name": "Dr. Jane Smith",
      "h_index": 45,
      "paper_count": 120
    }
  ]
}
```

#### Author Statistics
```
GET /authors/stats
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": {
    "total_authors": 500,
    "avg_h_index": 15.3,
    "max_h_index": 120
  }
}
```

#### Follow Author
```
POST /authors/:authorId/follow
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Now following author"
}
```

#### Unfollow Author
```
DELETE /authors/:authorId/follow
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Unfollowed author"
}
```

#### Check if Following Author
```
GET /authors/:authorId/following
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "is_following": true
  }
}
```

---


---

### Citations

#### Export Citation
```
GET /citations/export?paper_id=1&format=bib
Authorization: Bearer <token>

Query Parameters:
  - paper_id (required): ID of the paper to cite
  - format (optional): bib (BibTeX) or txt (Text), defaults to bib

Response: 200 OK
{
  "success": true,
  "data": {
    "filename": "researchhub-citation.bib",
    "format": "bib",
    "citation": "@article{researchhub1,\n  title={...},\n  journal={...},\n  year={2024}\n}"
  }
}
```

### Settings

#### Get Settings
```
GET /settings
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "theme": "system",
    "density": "comfortable",
    "notifications": { "email_alerts": true, "recommendations": true },
    "privacy": { "profile_visibility": "public" },
    "email_notifications": true,
    "paper_recommendations": true,
    "profile_visibility": "public"
  }
}
```

#### Update Settings
```
PUT /settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "dark",
  "email_notifications": true,
  "paper_recommendations": false,
  "profile_visibility": "followers"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "theme": "dark",
    "density": "comfortable",
    "notifications": { "email_alerts": true, "recommendations": false },
    "privacy": { "profile_visibility": "followers" },
    "email_notifications": true,
    "paper_recommendations": false,
    "profile_visibility": "followers"
  }
}
```

### Reviews

#### Get Reviews for Paper
```
GET /reviews/paper/:paperId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "review_id": 1,
      "paper_id": 1,
      "user_id": 1,
      "username": "researcher123",
      "full_name": "John Researcher",
      "rating": 4,
      "review_text": "Excellent paper...",
      "created_at": "2024-01-20T10:30:00Z"
    }
  ]
}
```

#### Create Review
```
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "paper_id": 1,
  "rating": 4,
  "review_text": "Excellent paper on deep learning..."
}

Response: 201 Created
{
  "success": true,
  "message": "Review created successfully"
}
```

### Questions & Answers

#### Get All Questions
```
GET /questions?limit=20&offset=0
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "question_id": 1,
      "user_id": 1,
      "username": "researcher123",
      "full_name": "John Researcher",
      "title": "How do I cite a conference paper?",
      "body": "...",
      "category": "Citations",
      "view_count": 12,
      "answer_count": 2
    }
  ],
  "stats": {
    "total_questions": 1,
    "total_answers": 2,
    "total_views": 12
  },
  "pagination": { "limit": 20, "offset": 0 }
}
```

#### Get My Questions
```
GET /questions/me
Authorization: Bearer <token>
```

#### Get Question by ID
```
GET /questions/:questionId
Authorization: Optional
```

#### Create Question
```
POST /questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "How do I cite a conference paper?",
  "body": "I need help citing...",
  "category": "Citations"
}
```

#### Answer Question
```
POST /questions/:questionId/answers
Authorization: Bearer <token>
Content-Type: application/json

{
  "body": "Use the conference name, year, and page range..."
}
```

### Admin

#### Get Dashboard
```
GET /admin/dashboard
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "users": { "total": 100, "active": 92 },
    "papers": { "total_papers": 1200 },
    "questions": { "total_questions": 18 },
    "email_queue": { "queued": 2, "pending": 1, "sent": 1, "failed": 0 },
    "platform": { "cached_profiles": 88 },
    "recent": []
  }
}
```

#### Get Admin Users
```
GET /admin/users?limit=20&offset=0
Authorization: Bearer <admin_token>
```

#### Recalculate Cached Stats
```
POST /admin/stats/recalculate
Authorization: Bearer <admin_token>
```

#### Moderation Queue
```
GET /admin/moderation/cases?limit=20&offset=0
Authorization: Bearer <admin_token>
```

#### Apply Moderation Action
```
POST /admin/moderation/cases/:caseId/actions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action_type": "hide",
  "notes": "Awaiting source verification"
}
```

Supported actions: `hide`, `restore`, `warn`, `suspend`, `ban`, `edit_metadata`, `delete`.

#### User Status and Roles
```
PATCH /admin/users/:userId/status
POST /admin/users/:userId/roles
Authorization: Bearer <admin_token>
```

Status body: `{ "is_active": false }`  
Role body: `{ "role_key": "moderator" }`

#### Audit and Email Queue
```
GET /admin/audit-logs?limit=20&offset=0
GET /admin/email-queue?limit=20&offset=0
POST /admin/email-queue/:emailId/retry
Authorization: Bearer <admin_token>
```

### Researcher Profiles

#### Get a Public Profile
```
GET /researchers/:slug
Authorization: Optional
```

Returns public identity, profile metadata, cached researcher metrics, verified public publications, and public questions.

#### Get My Researcher Profile
```
GET /researchers/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "user_id": 1,
    "slug": "jane-doe",
    "headline": "Senior AI Researcher",
    "department": "Computer Science",
    "position_title": "Professor",
    "visibility": "public"
  }
}
```

#### Create or Update My Profile
```
POST /researchers/me
PUT /researchers/me
Authorization: Bearer <token>
Content-Type: application/json
```

Create body: `{ "slug": "jane-doe" }`  
Update body supports `headline`, `department`, `position_title`, `website_url`, `orcid`, and `visibility` (`public`, `network`, or `private`).

### Oracle PL/SQL Package Boundary

Business mutations are implemented in Oracle and invoked through `pool.call()`:

- `PKG_PROFILE` — profile lifecycle and researcher follows
- `PKG_MODERATION` — report creation and moderation actions
- `PKG_ADMIN` — roles, account status, email retries, stats, and admin queue cursors

The API validates HTTP input and permissions; it does not duplicate these transactional rules in Express.

### Journals

#### Get All Journals
```
GET /journals?limit=20&offset=0
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "journal_id": 1,
      "name": "Nature Machine Intelligence",
      "impact_factor": 18.7,
      "publisher": "Nature Publishing Group",
      "h_index": 85,
      "website": "https://www.nature.com/natmachintell"
    }
  ]
}
```

#### Get Journal by ID
```
GET /journals/:journalId
Authorization: Optional

Response: 200 OK
```

#### Search Journals
```
GET /journals/search?q=nature&limit=20&offset=0
Authorization: Optional
```

#### Get Top Journals
```
GET /journals/top?limit=10
Authorization: Optional
```

#### Journal Statistics
```
GET /journals/stats
Authorization: Optional
```

---

### Research Fields

#### Get All Fields (Hierarchical)
```
GET /fields
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "field_id": 1,
      "field_name": "Computer Science",
      "children": [
        {
          "field_id": 2,
          "field_name": "Artificial Intelligence",
          "children": [
            {
              "field_id": 3,
              "field_name": "Natural Language Processing"
            }
          ]
        }
      ]
    }
  ]
}
```

#### Get Field by ID
```
GET /fields/:fieldId
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": {
    "field_id": 1,
    "field_name": "Computer Science",
    "parent": null,
    "children": [...],
    "papers": [...]
  }
}
```

#### Search Fields
```
GET /fields/search?q=machine+learning
Authorization: Optional
```

#### Get Field Hierarchy
```
GET /fields/hierarchy
Authorization: Optional
```

---

### Keywords

#### Get All Keywords
```
GET /keywords?limit=20&offset=0
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "keyword_id": 1,
      "keyword": "deep learning"
    }
  ]
}
```

#### Get Keyword by ID
```
GET /keywords/:keywordId
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": {
    "keyword_id": 1,
    "keyword": "deep learning",
    "papers": [...]
  }
}
```

#### Search Keywords
```
GET /keywords/search?q=learning
Authorization: Optional
```

#### Get Top Keywords
```
GET /keywords/top?limit=20
Authorization: Optional

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "keyword_id": 1,
      "keyword": "deep learning",
      "usage_count": 1203
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Search query is required"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided",
  "message": "Authorization header required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token",
  "message": "jwt expired"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

---

## Rate Limiting
No rate limiting enforced in development. Production deployments should implement rate limiting middleware.

## Pagination
All list endpoints support pagination:
- `limit`: Results per page (max 100, default 20)
- `offset`: Number of results to skip (default 0)

## Sorting
Papers endpoint supports sorting by:
- Citation count (default)
- Publication date
- View count

## Full-Text Search
The `/papers/search` endpoint uses Oracle Text through `CONTAINS` with a `LIKE` fallback:
- Supported on: title, abstract, keywords, authors, and fields
- Example: `deep learning`

---

## Testing Endpoints with cURL

### Get Health
```bash
curl http://localhost:3000/health
```

### Register
```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'
```

### Search Papers
```bash
curl "http://localhost:3000/api/v1/papers/search?query=AI&limit=10"
```

### Get Papers with Auth
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/papers/1
```

### Request Full Text
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/papers/1/request-fulltext
```

### Questions
```bash
curl http://localhost:3000/api/v1/questions
```

### Admin Dashboard
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/v1/admin/dashboard
```

---

## Version History

### v1.1.0 (2026-07-10)
- Added Questions and Answers endpoints tied to user profiles
- Added admin dashboard and cached researcher stats endpoints
- Added full-text request queueing via EMAIL_QUEUE
- Updated docs for admin, Q&A, and request workflows

### v1.0.0 (2024-01-20)
- Initial release
- User authentication with JWT
- Paper search and discovery
- Author, Journal, Field, Keyword endpoints
- Full-text search support
- Analytics endpoints

### Jobs

#### Get All Jobs
```http
GET /jobs
```
Response: 200 OK

#### Get Job Filters
```http
GET /jobs/filters
```
Response: 200 OK

#### Toggle Bookmark Job
```http
POST /jobs/:id/bookmark
Authorization: Bearer <token>
```
Response: 200 OK

#### Get Bookmarked Jobs
```http
GET /jobs/bookmarked
Authorization: Bearer <token>
```
Response: 200 OK

### Notifications

#### Get All Notifications
```http
GET /notifications
Authorization: Bearer <token>
```
Response: 200 OK

#### Mark Notification as Read
```http
PUT /notifications/:notificationId/read
Authorization: Bearer <token>
```
Response: 200 OK

### Research Requests

#### Get All Requests
```http
GET /researchRequests
Authorization: Bearer <token>
```
Response: 200 OK

#### Create Request
```http
POST /researchRequests
Authorization: Bearer <token>
```
Response: 201 Created

### Researcher Profiles

#### Create or Ensure My Profile
```http
POST /researchers/me
Authorization: Bearer <token>
```
Response: 200 OK

#### Update My Profile
```http
PUT /researchers/me
Authorization: Bearer <token>
```
Response: 200 OK

#### Get Public Profile by Slug
```http
GET /researchers/:slug
```
Response: 200 OK

#### Follow Researcher
```http
POST /researchers/:userId/follow
Authorization: Bearer <token>
```
Response: 200 OK

#### Unfollow Researcher
```http
DELETE /researchers/:userId/follow
Authorization: Bearer <token>
```
Response: 200 OK

#### Check Following Status
```http
GET /researchers/:userId/following
Authorization: Bearer <token>
```
Response: 200 OK

### Saved Papers

#### Get Saved Papers
```http
GET /savedPapers
Authorization: Bearer <token>
```
Response: 200 OK

#### Save a Paper
```http
POST /savedPapers
Authorization: Bearer <token>
```
Response: 201 Created

#### Remove Saved Paper
```http
DELETE /savedPapers/:paperId
Authorization: Bearer <token>
```
Response: 200 OK

### Settings

#### Get Settings
```http
GET /settings
Authorization: Bearer <token>
```
Response: 200 OK

#### Update Settings
```http
PUT /settings
Authorization: Bearer <token>
```
Response: 200 OK

### Questions

#### Get All Questions
```http
GET /questions
```
Response: 200 OK

#### Get My Questions
```http
GET /questions/me
Authorization: Bearer <token>
```
Response: 200 OK

#### Get Question by ID
```http
GET /questions/:questionId
```
Response: 200 OK

#### Create Question
```http
POST /questions
Authorization: Bearer <token>
```
Response: 201 Created

#### Answer Question
```http
POST /questions/:questionId/answers
Authorization: Bearer <token>
```
Response: 201 Created

---

## Support
For issues or questions, refer to the project README or contact the development team.
