# Environment Variables Configuration

This document outlines all required environment variables for running the ERPEZ application.

## Required Environment Variables

### Database Connection

#### `ConnectionStrings__DefaultConnection`

**Required:** Yes  
**Description:** PostgreSQL database connection string  
**Format:** `Host=localhost;Port=5432;Database=erpez_db;Username=your_user;Password=your_password`  
**Used in:** All environments (Development, Production)

### Azure Blob Storage

#### `AzureBlobStorage__ConnectionString`

**Required:** Yes  
**Description:** Azure Blob Storage connection string for file storage  
**Format:** `DefaultEndpointsProtocol=https;AccountName=your_account;AccountKey=your_key;EndpointSuffix=core.windows.net`  
**Used in:** All environments  
**Notes:**

- Azure Blob Storage is the only supported file storage provider
- Connection string must be provided for file upload/download operations to work

## Setting Environment Variables

### Local Development

#### Windows (PowerShell)

```powershell
$env:ConnectionStrings__DefaultConnection = "Host=localhost;Port=5432;Database=erpez_db;Username=postgres;Password=yourpassword"
$env:AzureBlobStorage__ConnectionString = "DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net"
```

#### Windows (Command Prompt)

```cmd
set ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=erpez_db;Username=postgres;Password=yourpassword
set AzureBlobStorage__ConnectionString=DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net
```

#### Linux/macOS (bash)

```bash
export ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=erpez_db;Username=postgres;Password=yourpassword"
export AzureBlobStorage__ConnectionString="DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net"
```

### Docker

When running with Docker, pass environment variables using `-e` flag:

```bash
docker run -d \
  --name erpez-api \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Development \
  -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Port=5432;Database=erpez_db;Username=postgres;Password=yourpassword" \
  -e AzureBlobStorage__ConnectionString="DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net" \
  erpez-api:latest
```

### CI/CD (GitHub Actions)

Environment variables are configured as GitHub Secrets in the repository settings:

#### Required Secrets

1. **`ERPEZ_DB_CONNECTION_STRING`**
   - Used for: Database connection
   - Mapped to: `ConnectionStrings__DefaultConnection`

2. **`AZURE_BLOB_STORAGE_CONNECTION_STRING`**
   - Used for: Azure Blob Storage connection
   - Mapped to: `AzureBlobStorage__ConnectionString`

#### Setting Secrets in GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its name and value
5. Click **Add secret**

The CI/CD pipeline (`.github/workflows/deploy-erpez-api-dev.yml`) automatically injects these secrets as environment variables during deployment.

## Configuration Files

### appsettings.json (Base Configuration)

```json
{
  "AzureBlobStorage": {
    "ContainerName": "files"
  }
}
```

### appsettings.Development.json

```json
{
  "AzureBlobStorage": {
    "ContainerName": "files"
  }
}
```

### appsettings.Production.json

```json
{
  "AzureBlobStorage": {
    "ContainerName": "files"
  }
}
```

## Storage Provider

The system uses Azure Blob Storage as the only supported storage provider for file uploads and downloads. Ensure that the Azure Blob Storage connection string is properly configured in all environments.

## Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate credentials regularly** (every 90 days recommended)
3. **Use separate connection strings** for development, staging, and production
4. **Limit database user permissions** to only what's needed
5. **Use Azure Managed Identity** in production when possible (future enhancement)
6. **Enable Azure Storage firewall** rules to restrict access
7. **Monitor access logs** for suspicious activity

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `psql -h localhost -U postgres -l`
- Check firewall rules allow connections on port 5432
- Verify credentials are correct
- For Docker: Use `host.docker.internal` instead of `localhost`

### Azure Blob Storage Issues

- Verify connection string format is correct
- Check Azure Storage account is active
- Verify container name exists (`files` by default)
- Check network connectivity to Azure endpoints
- Review application logs for detailed error messages

### Environment Variable Not Loading

- Verify variable name uses double underscores (`__`) for nested configuration
- Restart the application after setting environment variables
- Check variable is set in correct scope (system vs. user vs. process)
- For Docker: Ensure `-e` flags are before the image name

## Getting Azure Blob Storage Connection String

1. Log in to [Azure Portal](https://portal.azure.com)
2. Navigate to your Storage Account
3. Go to **Security + networking** → **Access keys**
4. Copy **Connection string** from Key1 or Key2
5. Store securely as `AZURE_BLOB_STORAGE_CONNECTION_STRING` secret

## Additional Resources

- [ASP.NET Core Configuration Documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- [Azure Blob Storage Documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/)
- [PostgreSQL Connection Strings](https://www.npgsql.org/doc/connection-string-parameters.html)
