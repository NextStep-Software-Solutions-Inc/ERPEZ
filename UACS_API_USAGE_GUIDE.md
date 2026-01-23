# UACS Library API Usage Guide

## Overview

This guide provides comprehensive examples for using the UACS (Unified Accounts Code Structure) Library API endpoints. The UACS Library manages the financial coding structure used across the ERPEZ system.

## Base URL

```
https://api.erpez.com/api
```

For development:
```
https://dev-api.erpez.com/api
```

---

## Authentication

All API requests require authentication using Bearer tokens:

```http
Authorization: Bearer {your-access-token}
```

---

## 1. UACS Code Segments

UACS Code Segments define the structure and validation rules for each of the 5 UACS elements.

### 1.1 Create Code Segment

**Endpoint:** `POST /uacs-code-segments`

**Request Body:**
```json
{
  "segmentType": 1,
  "name": "Fund Source Segment",
  "description": "Defines the structure for fund source codes in the UACS system",
  "displayOrder": 1,
  "isRequired": true,
  "maxLength": 10,
  "pattern": "^[0-9]{2}-[0-9]{3}$",
  "isActive": true
}
```

**Segment Types:**
- `1` = FundSource
- `2` = Organization
- `3` = Location
- `4` = MFOPAP
- `5` = Object

**Response (201 Created):**
```json
{
  "succeeded": true,
  "message": "UACS code segment created successfully.",
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "errors": null
}
```

### 1.2 List Code Segments

**Endpoint:** `GET /uacs-code-segments`

**Query Parameters:**
- `pageNumber` (default: 1) - Page number for pagination
- `pageSize` (default: 30) - Items per page
- `filters` - Sieve filter string
- `sorts` - Sieve sort string

**Examples:**

```http
# Get all active segments
GET /uacs-code-segments?filters=IsActive==true

# Get segments ordered by display order
GET /uacs-code-segments?sorts=DisplayOrder

# Get Fund Source type segments
GET /uacs-code-segments?filters=SegmentType==1

# Paginated request
GET /uacs-code-segments?pageNumber=1&pageSize=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "segmentType": 1,
      "name": "Fund Source Segment",
      "description": "Defines the structure for fund source codes",
      "displayOrder": 1,
      "isRequired": true,
      "maxLength": 10,
      "pattern": "^[0-9]{2}-[0-9]{3}$",
      "isActive": true,
      "createdAt": "2026-01-22T09:00:00Z",
      "createdBy": "admin@erpez.com"
    }
  ],
  "pageNumber": 1,
  "pageSize": 30,
  "totalCount": 5,
  "totalPages": 1
}
```

### 1.3 Get Code Segment by ID

**Endpoint:** `GET /uacs-code-segments/{id}`

**Response (200 OK):**
```json
{
  "succeeded": true,
  "message": "Retrieved successfully",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "segmentType": 1,
    "name": "Fund Source Segment",
    "description": "Defines the structure for fund source codes",
    "displayOrder": 1,
    "isRequired": true,
    "maxLength": 10,
    "pattern": "^[0-9]{2}-[0-9]{3}$",
    "isActive": true,
    "createdAt": "2026-01-22T09:00:00Z",
    "createdBy": "admin@erpez.com"
  },
  "errors": null
}
```

### 1.4 Update Code Segment

**Endpoint:** `PUT /uacs-code-segments/{id}`

**Request Body:**
```json
{
  "segmentType": 1,
  "name": "Fund Source Segment - Updated",
  "description": "Updated description for fund source codes",
  "displayOrder": 1,
  "isRequired": true,
  "maxLength": 15,
  "pattern": "^[0-9]{2}-[0-9]{3}-[A-Z]{2}$",
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "succeeded": true,
  "message": "UACS code segment updated successfully.",
  "data": {},
  "errors": null
}
```

### 1.5 Delete Code Segment

**Endpoint:** `DELETE /uacs-code-segments/{id}`

**Response (200 OK):**
```json
{
  "succeeded": true,
  "message": "UACS code segment with ID 3fa85f64-5717-4562-b3fc-2c963f66afa6 deleted successfully.",
  "data": {},
  "errors": null
}
```

---

## 2. UACS Validation Rules

Validation rules define custom business logic for validating UACS codes.

### 2.1 Create Validation Rule

**Endpoint:** `POST /uacs-validation-rules`

**Request Body:**
```json
{
  "ruleName": "Fund Source Format Rule",
  "description": "Validates that fund source codes follow the required format",
  "codeSegmentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "segmentType": 1,
  "validationExpression": "^[0-9]{2}-[0-9]{3}$",
  "errorMessage": "Fund source code must be in format XX-XXX where X is a digit",
  "isActive": true,
  "priority": 1
}
```

**Response (201 Created):**
```json
{
  "succeeded": true,
  "message": "UACS validation rule created successfully.",
  "data": "7ba85f64-5717-4562-b3fc-2c963f66afa6",
  "errors": null
}
```

### 2.2 List Validation Rules

**Endpoint:** `GET /uacs-validation-rules`

**Examples:**

```http
# Get all active rules
GET /uacs-validation-rules?filters=IsActive==true

# Get rules for specific segment
GET /uacs-validation-rules?filters=SegmentType==1

# Get rules ordered by priority
GET /uacs-validation-rules?sorts=Priority

# Get rules for specific code segment
GET /uacs-validation-rules?filters=CodeSegmentId==3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "7ba85f64-5717-4562-b3fc-2c963f66afa6",
      "ruleName": "Fund Source Format Rule",
      "description": "Validates that fund source codes follow the required format",
      "codeSegmentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "segmentType": 1,
      "validationExpression": "^[0-9]{2}-[0-9]{3}$",
      "errorMessage": "Fund source code must be in format XX-XXX",
      "isActive": true,
      "priority": 1,
      "createdAt": "2026-01-22T09:00:00Z",
      "createdBy": "admin@erpez.com"
    }
  ],
  "pageNumber": 1,
  "pageSize": 30,
  "totalCount": 10,
  "totalPages": 1
}
```

### 2.3 Get Validation Rule by ID

**Endpoint:** `GET /uacs-validation-rules/{id}`

### 2.4 Update Validation Rule

**Endpoint:** `PUT /uacs-validation-rules/{id}`

### 2.5 Delete Validation Rule

**Endpoint:** `DELETE /uacs-validation-rules/{id}`

---

## 3. UACS Code Combinations

Code combinations represent valid combinations of the 5 UACS elements.

### 3.1 Create Code Combination

**Endpoint:** `POST /uacs-code-combinations`

**Request Body:**
```json
{
  "fundSourceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organizationId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
  "locationId": "5fa85f64-5717-4562-b3fc-2c963f66afa6",
  "mfopapId": "6fa85f64-5717-4562-b3fc-2c963f66afa6",
  "objectId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
  "combinationCode": "01-101-001-P001-5021401000",
  "description": "Personnel Services - Regular Personnel - Department A",
  "isValid": true,
  "fiscalYearId": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
  "effectiveDate": "2026-01-01T00:00:00Z",
  "expiryDate": "2026-12-31T23:59:59Z",
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "succeeded": true,
  "message": "UACS code combination created successfully.",
  "data": "9fa85f64-5717-4562-b3fc-2c963f66afa6",
  "errors": null
}
```

### 3.2 List Code Combinations

**Endpoint:** `GET /uacs-code-combinations`

**Examples:**

```http
# Get all valid combinations
GET /uacs-code-combinations?filters=IsValid==true

# Get combinations for specific fund source
GET /uacs-code-combinations?filters=FundSourceId==3fa85f64-5717-4562-b3fc-2c963f66afa6

# Get combinations for current fiscal year
GET /uacs-code-combinations?filters=FiscalYearId==8fa85f64-5717-4562-b3fc-2c963f66afa6

# Get active combinations with sorting
GET /uacs-code-combinations?filters=IsActive==true&sorts=CombinationCode

# Search by combination code
GET /uacs-code-combinations?filters=CombinationCode@=*-101-*
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "9fa85f64-5717-4562-b3fc-2c963f66afa6",
      "fundSourceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "organizationId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
      "locationId": "5fa85f64-5717-4562-b3fc-2c963f66afa6",
      "mfopapId": "6fa85f64-5717-4562-b3fc-2c963f66afa6",
      "objectId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
      "combinationCode": "01-101-001-P001-5021401000",
      "description": "Personnel Services - Regular Personnel - Department A",
      "isValid": true,
      "fiscalYearId": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
      "effectiveDate": "2026-01-01T00:00:00Z",
      "expiryDate": "2026-12-31T23:59:59Z",
      "isActive": true,
      "createdAt": "2026-01-22T09:00:00Z",
      "createdBy": "admin@erpez.com"
    }
  ],
  "pageNumber": 1,
  "pageSize": 30,
  "totalCount": 250,
  "totalPages": 9
}
```

### 3.3 Get Code Combination by ID

**Endpoint:** `GET /uacs-code-combinations/{id}`

### 3.4 Update Code Combination

**Endpoint:** `PUT /uacs-code-combinations/{id}`

**Request Body:**
```json
{
  "fundSourceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organizationId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
  "locationId": "5fa85f64-5717-4562-b3fc-2c963f66afa6",
  "mfopapId": "6fa85f64-5717-4562-b3fc-2c963f66afa6",
  "objectId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
  "combinationCode": "01-101-001-P001-5021401000",
  "description": "Updated description",
  "isValid": true,
  "fiscalYearId": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
  "effectiveDate": "2026-01-01T00:00:00Z",
  "expiryDate": "2026-12-31T23:59:59Z",
  "isActive": true
}
```

### 3.5 Delete Code Combination

**Endpoint:** `DELETE /uacs-code-combinations/{id}`

---

## 4. Core UACS Elements

The 5 core UACS elements already have full CRUD operations:

### 4.1 Fund Sources

**Base Endpoint:** `/fund-sources`

**Operations:**
- `GET /fund-sources` - List all fund sources
- `GET /fund-sources/{id}` - Get by ID
- `POST /fund-sources` - Create new
- `PUT /fund-sources/{id}` - Update
- `DELETE /fund-sources/{id}` - Delete

**Example - Create Fund Source:**
```json
POST /fund-sources
{
  "parentId": null,
  "name": "General Fund",
  "code": "01",
  "type": "FundCluster",
  "isActive": true
}
```

### 4.2 Organizations

**Base Endpoint:** `/organizations`

**Example - List Organizations:**
```http
GET /organizations?filters=IsActive==true&sorts=Code
```

### 4.3 Locations

**Base Endpoint:** `/locations`

**Example - Create Location:**
```json
POST /locations
{
  "parentId": null,
  "name": "National Capital Region",
  "code": "NCR",
  "type": "Region",
  "isActive": true
}
```

### 4.4 MFOPAPs (Programs and Projects)

**Base Endpoint:** `/mfopaps`

**Example - List MFOPAPs:**
```http
GET /mfopaps?filters=Type==Program&sorts=-CreatedAt
```

### 4.5 Objects (Object of Expenditure)

**Base Endpoint:** `/objects`

**Example - Create Object:**
```json
POST /objects
{
  "parentId": null,
  "name": "Personnel Services",
  "code": "5020000000",
  "isActive": true
}
```

---

## 5. Sieve Filtering & Sorting

All GET endpoints support advanced filtering and sorting using Sieve.

### 5.1 Filter Operators

- `==` - Equals
- `!=` - Not equals
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `@=` - Contains (string)
- `_=` - Starts with (string)
- `@=*` - Contains (case insensitive)
- `!@=` - Does not contain
- `==*` - Equals any (comma-separated values)

### 5.2 Logical Operators

- `,` - AND
- `|` - OR

### 5.3 Filter Examples

```http
# Multiple filters with AND
GET /uacs-code-segments?filters=IsActive==true,SegmentType==1

# Multiple filters with OR
GET /uacs-code-segments?filters=SegmentType==1|SegmentType==2

# String contains
GET /uacs-validation-rules?filters=RuleName@=*format*

# Date range
GET /uacs-code-combinations?filters=EffectiveDate>=2026-01-01,ExpiryDate<=2026-12-31

# Multiple conditions
GET /uacs-code-combinations?filters=IsActive==true,IsValid==true,FiscalYearId==8fa85f64
```

### 5.4 Sort Examples

```http
# Single sort ascending
GET /uacs-code-segments?sorts=DisplayOrder

# Single sort descending
GET /uacs-code-segments?sorts=-CreatedAt

# Multiple sorts
GET /uacs-validation-rules?sorts=Priority,-CreatedAt
```

### 5.5 Pagination

```http
# Default pagination
GET /uacs-code-combinations?pageNumber=1&pageSize=30

# Custom page size
GET /uacs-code-combinations?pageNumber=1&pageSize=100

# With filters and sorts
GET /uacs-code-combinations?pageNumber=2&pageSize=50&filters=IsActive==true&sorts=CombinationCode
```

---

## 6. Error Responses

### 6.1 Validation Errors (400 Bad Request)

```json
{
  "succeeded": false,
  "message": "Validation failed",
  "data": null,
  "errors": {
    "Name": ["Code segment name must be at least 3 characters."],
    "Pattern": ["Validation pattern is required."]
  }
}
```

### 6.2 Not Found (404 Not Found)

```json
{
  "succeeded": false,
  "message": "UACS code segment not found.",
  "data": null,
  "errors": null
}
```

### 6.3 Conflict (409 Conflict)

```json
{
  "succeeded": false,
  "message": "UACS code segment for FundSource already exists.",
  "data": null,
  "errors": null
}
```

### 6.4 Unauthorized (401 Unauthorized)

```json
{
  "message": "Unauthorized access"
}
```

---

## 7. Best Practices

### 7.1 Pagination

Always use pagination for list endpoints:
```http
GET /uacs-code-combinations?pageNumber=1&pageSize=50
```

### 7.2 Filtering

Use specific filters to reduce response size:
```http
GET /uacs-code-segments?filters=IsActive==true,SegmentType==1
```

### 7.3 Error Handling

Always check the `succeeded` field in responses:
```javascript
const response = await fetch('/uacs-code-segments');
const data = await response.json();

if (data.succeeded) {
  // Handle success
} else {
  // Handle error
  console.error(data.message, data.errors);
}
```

### 7.4 Date Formats

Use ISO 8601 format for dates:
```json
{
  "effectiveDate": "2026-01-01T00:00:00Z",
  "expiryDate": "2026-12-31T23:59:59Z"
}
```

---

## 8. Integration Examples

### 8.1 JavaScript/TypeScript

```typescript
const API_BASE_URL = 'https://api.erpez.com/api';
const AUTH_TOKEN = 'your-bearer-token';

// Create UACS Code Segment
async function createCodeSegment(data) {
  const response = await fetch(`${API_BASE_URL}/uacs-code-segments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return await response.json();
}

// Get Code Combinations with filters
async function getCodeCombinations(filters = '') {
  const url = `${API_BASE_URL}/uacs-code-combinations?filters=${filters}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });
  
  return await response.json();
}

// Usage
const segment = await createCodeSegment({
  segmentType: 1,
  name: "Fund Source Segment",
  description: "Description here",
  displayOrder: 1,
  isRequired: true,
  maxLength: 10,
  pattern: "^[0-9]{2}-[0-9]{3}$",
  isActive: true
});

const combinations = await getCodeCombinations('IsActive==true,FiscalYearId==8fa85f64');
```

### 8.2 C# / .NET

```csharp
using System.Net.Http.Json;

public class UACSApiClient
{
    private readonly HttpClient _httpClient;
    
    public UACSApiClient(string baseUrl, string authToken)
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(baseUrl)
        };
        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", authToken);
    }
    
    public async Task<ApiResponse<Guid>> CreateCodeSegmentAsync(CreateCodeSegmentRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync("/uacs-code-segments", request);
        return await response.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
    }
    
    public async Task<PaginatedApiResponse<UACSCodeSegmentResponse>> GetCodeSegmentsAsync(
        string filters = "", int pageNumber = 1, int pageSize = 30)
    {
        var url = $"/uacs-code-segments?filters={filters}&pageNumber={pageNumber}&pageSize={pageSize}";
        return await _httpClient.GetFromJsonAsync<PaginatedApiResponse<UACSCodeSegmentResponse>>(url);
    }
}
```

### 8.3 Python

```python
import requests

class UACSApiClient:
    def __init__(self, base_url, auth_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {auth_token}',
            'Content-Type': 'application/json'
        }
    
    def create_code_segment(self, data):
        url = f'{self.base_url}/uacs-code-segments'
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def get_code_combinations(self, filters=''):
        url = f'{self.base_url}/uacs-code-combinations?filters={filters}'
        response = requests.get(url, headers=self.headers)
        return response.json()

# Usage
client = UACSApiClient('https://api.erpez.com/api', 'your-token')
segment = client.create_code_segment({
    'segmentType': 1,
    'name': 'Fund Source Segment',
    'description': 'Description',
    'displayOrder': 1,
    'isRequired': True,
    'maxLength': 10,
    'pattern': '^[0-9]{2}-[0-9]{3}$',
    'isActive': True
})
```

---

## 9. Postman Collection

A complete Postman collection is available for testing all endpoints:

[Download UACS Library Postman Collection](#)

---

## 10. Support & Resources

- **API Documentation:** https://docs.erpez.com/api/uacs
- **Developer Portal:** https://developers.erpez.com
- **Support Email:** api-support@erpez.com
- **GitHub Issues:** https://github.com/NextStep-Software-Solutions-Inc/ERPEZ/issues

---

**Last Updated:** January 22, 2026  
**Version:** 1.0
