# ResearchHub API Documentation

## Overview
The ResearchHub API provides RESTful endpoints for accessing and managing academic research papers, authors, journals, and more. Built with Express.js and MySQL, it supports full-text search, filtering, sorting, and analytics.

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

---

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
The `/papers/search` endpoint uses MySQL full-text search:
- Supported on: title, abstract
- Operators: +required -excluded "exact phrase"
- Example: `+AI -boring "deep learning"`

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

---

## Version History

### v1.0.0 (2024-01-20)
- Initial release
- User authentication with JWT
- Paper search and discovery
- Author, Journal, Field, Keyword endpoints
- Full-text search support
- Analytics endpoints

---

## Support
For issues or questions, refer to the project README or contact the development team.
