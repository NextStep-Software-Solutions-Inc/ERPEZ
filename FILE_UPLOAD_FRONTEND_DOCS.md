# ERPEZ File Upload API Documentation

## Overview

The ERPEZ system provides a secure, two-step file upload mechanism designed for Clean Architecture. Files are uploaded to temporary storage first, then promoted to permanent storage during business operations.

## API Endpoints

### 1. Upload File to Temporary Storage

**Endpoint:** `POST /files/upload`

**Purpose:** Upload a file to temporary storage and get a unique file identifier.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with file

```javascript
const formData = new FormData();
formData.append('file', selectedFile);

const response = await fetch('/files/upload', {
  method: 'POST',
  body: formData
});
```

**Response:**

```json
{
  "succeeded": true,
  "message": "File uploaded successfully.",
  "data": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response:**

```json
{
  "succeeded": false,
  "message": "No file provided.",
  "data": null
}
```

### 2. Download File from Permanent Storage

**Endpoint:** `GET /files/download/{fileId}`

**Purpose:** Download a file that has been promoted to permanent storage.

**Request:**

```javascript
const response = await fetch(`/files/download/${fileId}`);
if (response.ok) {
  const blob = await response.blob();
  // Handle the downloaded file
}
```

**Response:** Binary file data with appropriate Content-Type headers.

## File Upload Flow

### Step 1: File Selection & Upload

```javascript
// Frontend Implementation
async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/files/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.succeeded) {
      return result.data; // fileId (Guid)
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

### Step 2: Include FileId in Business Operations

```javascript
// Example: Creating a KPI with file attachment
async function createKPI(kpiData, file) {
  try {
    // First upload the file
    const fileId = await uploadFile(file);

    // Then create the KPI with the fileId
    const kpiPayload = {
      name: kpiData.name,
      description: kpiData.description,
      // ... other KPI properties
      KPIMOVs: [{
        description: "Mode of Verification",
        fileId: fileId  // Include the uploaded fileId
      }]
    };

    const response = await fetch('/kpi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(kpiPayload)
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('KPI creation failed:', error);
    throw error;
  }
}
```

### Step 3: File Access

```javascript
// Download/View file
async function downloadFile(fileId) {
  try {
    const response = await fetch(`/files/download/${fileId}`);

    if (!response.ok) {
      throw new Error('File not found');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create download link or display file
    const link = document.createElement('a');
    link.href = url;
    link.download = 'downloaded-file'; // You might want to get filename from response
    link.click();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Download failed:', error);
  }
}
```

## Complete React Component Example

```jsx
import React, { useState } from 'react';

function FileUploadComponent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/files/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.succeeded) {
        setUploadedFileId(result.data);
        alert('File uploaded successfully!');
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (error) {
      alert('Upload error: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = async () => {
    if (!uploadedFileId) return;

    try {
      const response = await fetch(`/files/download/${uploadedFileId}`);

      if (!response.ok) {
        throw new Error('File not found');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = selectedFile?.name || 'downloaded-file';
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Download failed: ' + error.message);
    }
  };

  return (
    <div>
      <h3>File Upload Example</h3>

      <input
        type="file"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      <button
        onClick={uploadFile}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>

      {uploadedFileId && (
        <div>
          <p>File uploaded with ID: {uploadedFileId}</p>
          <button onClick={downloadFile}>
            Download File
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUploadComponent;
```

## Integration with Business Entities

### KPI Mode of Verification (MOV)

```javascript
// When creating a KPI with file attachment
const createKPIPayload = {
  name: "Sample KPI",
  description: "KPI description",
  functionType: "Planning",
  // ... other KPI properties
  KPIMOVs: [{
    description: "Supporting document",
    fileId: uploadedFileId  // From file upload step
  }]
};
```

### Other Entities

The same pattern applies to any entity that supports file attachments:

```javascript
// Generic pattern
const entityPayload = {
  // ... entity properties
  fileId: uploadedFileId  // Include fileId in the request
};
```

## Error Handling

### Common Error Scenarios

1. **File too large**
   - Check file size before upload
   - Backend validates file size limits

2. **Invalid file type**
   - Validate file extensions on frontend
   - Backend performs additional validation

3. **Network errors**
   - Implement retry logic
   - Show user-friendly error messages

4. **File not found**
   - Handle 404 responses from download endpoint
   - Check if file was properly promoted

### Error Response Format

```json
{
  "succeeded": false,
  "message": "Error description",
  "data": null
}
```

## File Storage Behavior

### Temporary Storage

- Files uploaded to `/files/upload` are stored temporarily
- Automatic cleanup after 1 hour
- Files are not accessible until promoted

### Permanent Storage

- Files are moved to permanent storage during business operations
- Accessible via `/files/download/{fileId}`
- Files persist until explicitly deleted

### Storage Providers

- **Primary:** Azure Blob Storage (if configured)
- **Fallback:** Local file system
- **Migration:** Files can be moved between providers

## Best Practices

### Frontend Implementation

1. **File Validation**

   ```javascript
   const validateFile = (file) => {
     const maxSize = 10 * 1024 * 1024; // 10MB
     const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

     if (file.size > maxSize) {
       throw new Error('File too large');
     }

     if (!allowedTypes.includes(file.type)) {
       throw new Error('Invalid file type');
     }

     return true;
   };
   ```

2. **Progress Indication**

   ```javascript
   const uploadWithProgress = async (file) => {
     return new Promise((resolve, reject) => {
       const xhr = new XMLHttpRequest();

       xhr.upload.addEventListener('progress', (event) => {
         if (event.lengthComputable) {
           const percent = (event.loaded / event.total) * 100;
           // Update progress UI
         }
       });

       xhr.addEventListener('load', () => {
         if (xhr.status === 200) {
           resolve(JSON.parse(xhr.responseText));
         } else {
           reject(new Error('Upload failed'));
         }
       });

       xhr.addEventListener('error', () => reject(new Error('Network error')));

       const formData = new FormData();
       formData.append('file', file);

       xhr.open('POST', '/files/upload');
       xhr.send(formData);
     });
   };
   ```

3. **Error Recovery**

   ```javascript
   const uploadWithRetry = async (file, maxRetries = 3) => {
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         return await uploadFile(file);
       } catch (error) {
         if (attempt === maxRetries) throw error;

         // Wait before retry (exponential backoff)
         await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
       }
     }
   };
   ```

### Security Considerations

1. **File Type Validation**
   - Check MIME types on both frontend and backend
   - Scan for malicious content if possible

2. **Access Control**
   - Ensure users can only access their own files
   - Implement proper authorization checks

3. **Storage Limits**
   - Monitor storage usage
   - Implement file size limits
   - Clean up unused files regularly

## API Response Types

### ApiResponse<T> Structure

```typescript
interface ApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data?: T;
}
```

### File Upload Response

```typescript
type FileUploadResponse = ApiResponse<string>; // Guid as string
```

### Business Operation Response

```typescript
type CreateEntityResponse = ApiResponse<string>; // Entity ID as string
```

## Testing

### Unit Tests for File Upload

```javascript
describe('File Upload', () => {
  test('should upload file successfully', async () => {
    const mockFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf'
    });

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          succeeded: true,
          data: '550e8400-e29b-41d4-a716-446655440000'
        })
      })
    );

    const fileId = await uploadFile(mockFile);
    expect(fileId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('should handle upload failure', async () => {
    const mockFile = new File(['test'], 'test.pdf');

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          succeeded: false,
          message: 'Upload failed'
        })
      })
    );

    await expect(uploadFile(mockFile)).rejects.toThrow('Upload failed');
  });
});
```

## Configuration

### Environment-Specific Settings

**Development (`appsettings.Development.json`):**

```json
{
  "AzureBlobStorage": {
    "ConnectionString": "",
    "ContainerName": "files",
    "ForceAzureOnly": false
  }
}
```

**Production (`appsettings.Production.json`):**

```json
{
  "AzureBlobStorage": {
    "ConnectionString": "DefaultEndpointsProtocol=https;...",
    "ContainerName": "files",
    "ForceAzureOnly": true
  }
}
```

### ForceAzureOnly Behavior

- `false`: Try Azure first, fallback to local storage
- `true`: Require Azure storage, fail if unavailable

## Troubleshooting

### Common Issues

1. **File not found after upload**
   - Ensure file was promoted during business operation
   - Check if temp file cleanup removed the file

2. **Upload fails silently**
   - Check network connectivity
   - Verify file size limits
   - Check CORS configuration

3. **Download fails**
   - Verify fileId is correct
   - Check if file exists in permanent storage
   - Ensure proper authorization

### Debug Information

```javascript
// Add logging to track file operations
const uploadFile = async (file) => {
  console.log('Uploading file:', {
    name: file.name,
    size: file.size,
    type: file.type
  });

  // ... upload logic

  console.log('Upload result:', result);
  return result.data;
};
```

## Support

For additional support or questions about file upload implementation:

1. Check the API documentation for detailed endpoint specifications
2. Review the backend code for business logic integration
3. Contact the backend team for storage configuration questions

---

**Note:** This documentation assumes a standard ERPEZ API setup. Environment-specific configurations may vary.

</content>
<parameter name="filePath">f:\projects\github\ERPEZ\FILE_UPLOAD_FRONTEND_DOCS.md
