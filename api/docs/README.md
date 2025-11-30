# DockNow API Testing Guide

## 📁 Documentation Files

All API documentation is located in `/api/docs/`:

- `openapi.yaml` - OpenAPI 3.0 specification
- `DockNow-API.postman_collection.json` - Postman collection
- `API_DOCUMENTATION.md` - Complete API reference
- `API_STRUCTURE.md` - Architecture overview

---

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import** button
3. Select `api/docs/DockNow-API.postman_collection.json`
4. Collection will be imported with all endpoints

### Set Up Environment

1. Create new environment in Postman
2. Add variables:
   - `baseUrl`: `http://localhost:3000` (for local)
   - `baseUrl`: `https://your-app.vercel.app` (for production)
   - `token`: `your-jwt-token` (after authentication)

### Available Endpoints

#### Authentication

- ✅ POST `/api/auth/register` - Register new user
- ✅ POST `/api/auth/send-code` - Send verification code
- ✅ POST `/api/auth/verify-code` - Verify email code
- ✅ POST `/api/auth/validate-email` - Validate email
- ✅ GET `/api/auth/me` - Get current user (requires token)

#### Marinas

- ✅ GET `/api/marinas/filters` - Get all filter options
- ✅ GET `/api/marinas/search` - Basic marina search
- ✅ GET `/api/marinas/search-advanced` - Advanced search with filters
- ✅ GET `/api/marinas/:slug` - Get marina by slug
- ✅ GET `/api/marinas/detail/:slug` - Get detailed marina info

---

## 🚀 Quick Test Commands

### Test Filters API

```bash
curl http://localhost:3000/api/marinas/filters | jq
```

### Test Marina Search

```bash
curl "http://localhost:3000/api/marinas/search-advanced?location=Miami&limit=5" | jq
```

### Test Marina Details

```bash
curl http://localhost:3000/api/marinas/miami-marina | jq
```

### Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }' | jq
```

---

## 📱 iOS App Integration

Use the same endpoints in your iOS app:

```swift
let baseURL = "https://your-app.vercel.app"

// Example: Get filters
func getFilters() async throws -> FiltersResponse {
    let url = URL(string: "\(baseURL)/api/marinas/filters")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(FiltersResponse.self, from: data)
}
```

---

## 🔐 Authentication Flow

1. **Register**: `POST /api/auth/register`
2. **Send Code**: `POST /api/auth/send-code`
3. **Verify**: `POST /api/auth/verify-code`
4. **Get Token**: Use token from verify response
5. **Use Token**: Add to Authorization header: `Bearer {token}`

---

## 📊 Response Examples

### Marina Search Response

```json
{
  "marinas": [
    {
      "id": 1,
      "name": "Miami Marina",
      "slug": "miami-marina",
      "price_per_day": 150,
      "city": "Miami",
      "state": "Florida",
      "latitude": 25.7617,
      "longitude": -80.1918,
      "review_count": 45,
      "avg_rating": 4.5
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### Filters Response

```json
{
  "amenityTypes": [
    {
      "id": 1,
      "name": "Electricity",
      "slug": "electricity",
      "icon": "⚡",
      "category": "utility"
    }
  ],
  "anchorageTypes": [...],
  "mooringTypes": [...],
  "seabedTypes": [...],
  "pointTypes": [...]
}
```

---

## 🌐 CORS Configuration

All APIs support CORS for cross-origin requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📝 Notes

- All GET endpoints return JSON
- POST endpoints require `Content-Type: application/json`
- Protected endpoints require `Authorization: Bearer {token}`
- Dates should be in `YYYY-MM-DD` format
- Pagination uses `limit` and `offset` parameters
