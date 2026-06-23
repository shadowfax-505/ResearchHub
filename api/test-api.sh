#!/bin/bash
# ResearchHub API Testing Script
# Usage: bash test-api.sh

BASE_URL="http://localhost:3000/api/v1"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== ResearchHub API Testing ====${NC}\n"

# 1. Health Check
echo -e "${BLUE}1. Health Check${NC}"
curl http://localhost:3000/health | jq .
echo -e "\n"

# 2. Register User
echo -e "${BLUE}2. Register User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser'$(date +%s)'",
    "email": "test'$(date +%s)'@example.com",
    "password": "testpass123",
    "full_name": "Test User",
    "affiliation": "Test University",
    "country": "United States"
  }')
echo $REGISTER_RESPONSE | jq .
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo -e "${GREEN}Token: $TOKEN${NC}\n"

# 3. Login
echo -e "${BLUE}3. Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser'$(date +%s)'",
    "password": "testpass123"
  }')
echo $LOGIN_RESPONSE | jq .
echo -e "\n"

# 4. Get All Users
echo -e "${BLUE}4. Get All Users${NC}"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/users?limit=5" | jq .
echo -e "\n"

# 5. Get User Stats
echo -e "${BLUE}5. Get User Stats${NC}"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/users/stats" | jq .
echo -e "\n"

# 6. Search Papers
echo -e "${BLUE}6. Search Papers${NC}"
curl -s "$BASE_URL/papers/search?query=machine+learning&limit=5" | jq .
echo -e "\n"

# 7. Get Top Cited Papers
echo -e "${BLUE}7. Get Top Cited Papers${NC}"
curl -s "$BASE_URL/papers/top-cited?limit=5" | jq .
echo -e "\n"

# 8. Get Trending Papers
echo -e "${BLUE}8. Get Trending Papers${NC}"
curl -s "$BASE_URL/papers/trending?days=30&limit=5" | jq .
echo -e "\n"

# 9. Get Paper Stats
echo -e "${BLUE}9. Get Paper Stats${NC}"
curl -s "$BASE_URL/papers/stats" | jq .
echo -e "\n"

# 10. Get All Authors
echo -e "${BLUE}10. Get All Authors${NC}"
curl -s "$BASE_URL/authors?limit=5" | jq .
echo -e "\n"

# 11. Get Top Authors
echo -e "${BLUE}11. Get Top Authors${NC}"
curl -s "$BASE_URL/authors/top?limit=5" | jq .
echo -e "\n"

# 12. Search Authors
echo -e "${BLUE}12. Search Authors${NC}"
curl -s "$BASE_URL/authors/search?q=smith&limit=5" | jq .
echo -e "\n"

# 13. Get Author Stats
echo -e "${BLUE}13. Get Author Stats${NC}"
curl -s "$BASE_URL/authors/stats" | jq .
echo -e "\n"

# 14. Get All Journals
echo -e "${BLUE}14. Get All Journals${NC}"
curl -s "$BASE_URL/journals?limit=5" | jq .
echo -e "\n"

# 15. Get Top Journals
echo -e "${BLUE}15. Get Top Journals${NC}"
curl -s "$BASE_URL/journals/top?limit=5" | jq .
echo -e "\n"

# 16. Search Journals
echo -e "${BLUE}16. Search Journals${NC}"
curl -s "$BASE_URL/journals/search?q=nature&limit=5" | jq .
echo -e "\n"

# 17. Get Journal Stats
echo -e "${BLUE}17. Get Journal Stats${NC}"
curl -s "$BASE_URL/journals/stats" | jq .
echo -e "\n"

# 18. Get Field Hierarchy
echo -e "${BLUE}18. Get Field Hierarchy${NC}"
curl -s "$BASE_URL/fields/hierarchy" | jq . | head -50
echo -e "\n"

# 19. Get All Keywords
echo -e "${BLUE}19. Get All Keywords${NC}"
curl -s "$BASE_URL/keywords?limit=5" | jq .
echo -e "\n"

# 20. Get Top Keywords
echo -e "${BLUE}20. Get Top Keywords${NC}"
curl -s "$BASE_URL/keywords/top?limit=10" | jq .
echo -e "\n"

# 21. Search Keywords
echo -e "${BLUE}21. Search Keywords${NC}"
curl -s "$BASE_URL/keywords/search?q=learning&limit=5" | jq .
echo -e "\n"

echo -e "${GREEN}All tests completed!${NC}"
