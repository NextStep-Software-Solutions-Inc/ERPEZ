using ERPEZ.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Infrastructure.Services;

public class FallbackFileStorageService(
    AzureBlobStorageService azureStorageService,
    LocalFileStorageService localStorageService,
    ILogger<FallbackFileStorageService> logger) : IFileStorageService
{
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
                logger.LogWarning(ex, "Azure Blob upload failed, falling back to local storage.");
                useAzure = false;
            }
        }
        return await localStorageService.UploadTempAsync(stream, fileName);
    }

    public async Task<string> PromoteFileAsync(Guid fileId)
    {
        if (useAzure)
        {
            try
            {
                return await azureStorageService.PromoteFileAsync(fileId);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Azure Blob promote failed, falling back to local storage.");
                useAzure = false;
            }
        }
        return await localStorageService.PromoteFileAsync(fileId);
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
                logger.LogWarning(ex, "Azure Blob cleanup failed, falling back to local storage.");
                useAzure = false;
            }
        }
        await localStorageService.DeleteExpiredTempFilesAsync(retentionPeriod);
    }
}
