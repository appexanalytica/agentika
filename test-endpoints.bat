@echo off
echo ===== TESTING AGENTIKA BLOG ENDPOINTS =====
echo.

echo [1] Testing /health endpoint...
curl -s http://localhost:5000/health
echo.
echo.

echo [2] Testing /api/blog endpoint (published posts)...
curl -s "http://localhost:5000/api/blog?page=1&limit=10&status=published"
echo.
echo.

echo [3] Testing /api/blog endpoint (all posts)...
curl -s "http://localhost:5000/api/blog?page=1&limit=100"
echo.
echo.

echo ===== TEST COMPLETE =====
