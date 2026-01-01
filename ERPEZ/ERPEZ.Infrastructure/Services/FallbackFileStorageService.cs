using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ERPEZ.Infrastructure.Services;

public class FallbackFileStorageService(
    AzureBlobStorageService azureStorageService,
    LocalFileStorageService localStorageService,
    IOptions<AzureBlobStorageOptions> azureOptions,
    ILogger<FallbackFileStorageService> logger) : IFileStorageService
{
    private readonly bool forceAzureOnly = azureOptions.Value.ForceAzureOnly;
    private bool useAzure = true;

    public async Task<Guid> UploadTempAsync(Stream stream, string fileName)
    {
        if (useAzure)
        {
            try
            {
                return await azureStorageService.UploadTempAsync(stream, fileName);
            }
            catch (Exception ex)
            {
                if (forceAzureOnly)
                {
                    throw new InvalidOperationException("Azure Blob Storage is required but unavailable.", ex);
                }
                logger.LogWarning(ex, "Azure Blob upload failed, falling back to local storage.");
                useAzure = false;
                
                // Reset stream position for fallback attempt
                if (stream.CanSeek)
                {
                    stream.Position = 0;
                }
                else
                {
                    throw new InvalidOperationException("Cannot fallback to local storage: stream is not seekable and has been consumed.", ex);
                }
            }
        }
        if (!forceAzureOnly)
        {
            return await localStorageService.UploadTempAsync(stream, fileName);
        }
        throw new InvalidOperationException("Azure Blob Storage is required but unavailable.");
    }

    public async Task<string> PromoteFileAsync(Guid fileId)
    {
        Exception? azureException = null;
        Exception? localException = null;
        
        // Always try Azure first (priority)
        try
        {
            return await azureStorageService.PromoteFileAsync(fileId);
        }
        catch (FileNotFoundException ex)
        {
            // File might be in local storage if upload fell back
            logger.LogWarning(ex, "File not found in Azure temp storage, trying local storage.");
            azureException = ex;
            if (forceAzureOnly)
            {
                throw new InvalidOperationException("Azure Blob Storage is required but file not found.", ex);
            }
            useAzure = false;
        }
        catch (Exception ex)
        {
            azureException = ex;
            if (forceAzureOnly)
            {
                throw new InvalidOperationException("Azure Blob Storage is required but unavailable.", ex);
            }
            logger.LogWarning(ex, "Azure Blob promote failed, falling back to local storage.");
            useAzure = false;
        }
        
        // Try local storage as fallback
        if (!forceAzureOnly)
        {
            try
            {
                return await localStorageService.PromoteFileAsync(fileId);
            }
            catch (FileNotFoundException ex)
            {
                localException = ex;
                // File not found in either provider
                logger.LogError("File with ID {FileId} not found in any storage provider. Azure: {AzureError}, Local: {LocalError}", 
                    fileId, azureException?.Message ?? "Unknown error", localException.Message);
                throw new FileNotFoundException($"Temp file with ID {fileId} not found in any storage provider.");
            }
        }
        
        throw new InvalidOperationException("Azure Blob Storage is required but unavailable.");
    }

    public async Task DeleteExpiredTempFilesAsync(TimeSpan retentionPeriod)
    {
        if (useAzure)
        {
            try
            {
                await azureStorageService.DeleteExpiredTempFilesAsync(retentionPeriod);
                return;
            }
            catch (Exception ex)
            {
                if (forceAzureOnly)
                {
                    throw new InvalidOperationException("Azure Blob Storage is required but unavailable.", ex);
                }
                logger.LogWarning(ex, "Azure Blob cleanup failed, falling back to local storage.");
                useAzure = false;
            }
        }
        if (!forceAzureOnly)
        {
            await localStorageService.DeleteExpiredTempFilesAsync(retentionPeriod);
            return;
        }
        throw new InvalidOperationException("Azure Blob Storage is required but unavailable.");
    }

    public async Task<bool> MigrateFileAsync(Guid fileId, StorageProviderEnum fromProvider, StorageProviderEnum toProvider)
    {
        if (fromProvider == toProvider)
        {
            return true; // Already in the target provider
        }

        try
        {
            // Get file from source
            IFileStorageService sourceService = fromProvider == StorageProviderEnum.Azure ? azureStorageService : localStorageService;
            var fileInfo = await sourceService.GetPermanentFileAsync(fileId);
            if (fileInfo == null)
            {
                logger.LogWarning("File {FileId} not found in source provider {Provider}", fileId, fromProvider);
                return false;
            }

            var (fileName, stream) = fileInfo.Value;

            // Upload to target
            IFileStorageService targetService = toProvider == StorageProviderEnum.Azure ? azureStorageService : localStorageService;
            await targetService.UploadPermanentAsync(fileName, stream);

            // Delete from source
            await sourceService.DeletePermanentAsync(fileId);

            logger.LogInformation("Successfully migrated file {FileId} from {From} to {To}", fileId, fromProvider, toProvider);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to migrate file {FileId} from {From} to {To}", fileId, fromProvider, toProvider);
            return false;
        }
    }

    public async Task<(string fileName, Stream stream)?> GetPermanentFileAsync(Guid fileId)
    {
        if (useAzure)
        {
            try
            {
                return await azureStorageService.GetPermanentFileAsync(fileId);
            }
            catch (Exception ex)
            {
                if (forceAzureOnly)
                {
                    throw new InvalidOperationException("Azure Blob Storage is required but unavailable.", ex);
                }
                logger.LogWarning(ex, "Azure Blob get permanent failed, falling back to local storage.");
                useAzure = false;
            }
        }
        if (!forceAzureOnly)
        {
            return await localStorageService.GetPermanentFileAsync(fileId);
        }
        throw new InvalidOperationException("Azure Blob Storage is required but unavailable.");
    }

    public async Task UploadPermanentAsync(string fileName, Stream stream)
    {
        if (useAzure)
        {
            try
            {
                await azureStorageService.UploadPermanentAsync(fileName, stream);
                return;
            }
            catch (Exception ex)
            {
                if (forceAzureOnly)
                {
                    throw new InvalidOperationException("Azure Blob Storage is required but unavailable.", ex);
                }
                logger.LogWarning(ex, "Azure Blob upload permanent failed, falling back to local storage.");
                useAzure = false;
            }
        }
        if (!forceAzureOnly)
        {
            await localStorageService.UploadPermanentAsync(fileName, stream);
            return;
        }
        throw new InvalidOperationException("Azure Blob Storage is required but unavailable.");
    }

    public async Task DeletePermanentAsync(Guid fileId)
    {
        if (useAzure)
        {
            try
            {
                await azureStorageService.DeletePermanentAsync(fileId);
                return;
            }
            catch (Exception ex)
            {
                if (forceAzureOnly)
                {
                    throw new InvalidOperationException("Azure Blob Storage is required but unavailable.", ex);
                }
                logger.LogWarning(ex, "Azure Blob delete permanent failed, falling back to local storage.");
                useAzure = false;
            }
        }
        if (!forceAzureOnly)
        {
            await localStorageService.DeletePermanentAsync(fileId);
            return;
        }
        throw new InvalidOperationException("Azure Blob Storage is required but unavailable.");
    }
}
