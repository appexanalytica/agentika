#!/bin/bash

# Script to test Agentika Backend API

API_URL="http://localhost:5000/api"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing Agentika Backend API${NC}\n"

# Test 1: Register User
echo -e "${BLUE}1. Testing User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }')

echo "$REGISTER_RESPONSE" | jq .
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
echo -e "${GREEN}✓ Registration complete${NC}\n"

# Test 2: Login User
echo -e "${BLUE}2. Testing User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | jq .
echo -e "${GREEN}✓ Login complete${NC}\n"

# Test 3: Get Profile
echo -e "${BLUE}3. Testing Get Profile${NC}"
curl -s -X GET "$API_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✓ Profile retrieved${NC}\n"

# Test 4: Create Blog Post
echo -e "${BLUE}4. Testing Create Blog Post${NC}"
POST_RESPONSE=$(curl -s -X POST "$API_URL/blog" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "This is my first blog post content",
    "excerpt": "This is the excerpt",
    "tags": "nodejs,javascript,backend"
  }')

echo "$POST_RESPONSE" | jq .
POST_ID=$(echo "$POST_RESPONSE" | jq -r '.data._id')
echo -e "${GREEN}✓ Post created${NC}\n"

# Test 5: Get All Posts
echo -e "${BLUE}5. Testing Get All Posts${NC}"
curl -s -X GET "$API_URL/blog?status=draft" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✓ Posts retrieved${NC}\n"

# Test 6: Get Single Post
echo -e "${BLUE}6. Testing Get Single Post${NC}"
curl -s -X GET "$API_URL/blog/post/$POST_ID" | jq .
echo -e "${GREEN}✓ Single post retrieved${NC}\n"

# Test 7: Like Post
echo -e "${BLUE}7. Testing Like Post${NC}"
curl -s -X POST "$API_URL/blog/$POST_ID/like" | jq .
echo -e "${GREEN}✓ Post liked${NC}\n"

# Test 8: Search Posts
echo -e "${BLUE}8. Testing Search Posts${NC}"
curl -s -X GET "$API_URL/blog/search?query=nodejs" | jq .
echo -e "${GREEN}✓ Posts searched${NC}\n"

echo -e "${GREEN}All tests completed!${NC}"
