using Azure.Storage.Blobs;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ERPEZ.Infrastructure.Services;

public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient blobServiceClient;
    private readonly string tempContainer = "temp";
    private readonly string permanentContainer = "permanent";
    private readonly ILogger<AzureBlobStorageService> logger;

    public AzureBlobStorageService(IOptions<AzureBlobStorageOptions> options, ILogger<AzureBlobStorageService> logger)
    {
        var connectionString = options.Value.ConnectionString;
        blobServiceClient = new BlobServiceClient(connectionString);
        this.logger = logger;
        // Note: Containers should be created manually or via code if needed
    }

    public async Task<Guid> UploadTempAsync(Stream stream, string fileName)
    {
        var fileId = Guid.NewGuid();
        var extension = Path.GetExtension(fileName);
        var baseName = Path.GetFileNameWithoutExtension(fileName);
        var blobName = $"{fileId}_{baseName}{extension}";

        var containerClient = blobServiceClient.GetBlobContainerClient(tempContainer);
        var blobClient = containerClient.GetBlobClient(blobName);

        await blobClient.UploadAsync(stream, overwrite: true);
        logger.LogInformation("Blob uploaded to temp: {BlobName}", blobName);
        return fileId;
    }

    public async Task<string> PromoteFileAsync(Guid fileId)
    {
        var tempContainerClient = blobServiceClient.GetBlobContainerClient(tempContainer);
        var permanentContainerClient = blobServiceClient.GetBlobContainerClient(permanentContainer);

        var blobs = tempContainerClient.GetBlobsAsync(prefix: fileId.ToString());
        await foreach (var blobItem in blobs)
        {
            var blobName = blobItem.Name;
            var tempBlobClient = tempContainerClient.GetBlobClient(blobName);
            var permanentBlobClient = permanentContainerClient.GetBlobClient(blobName);

            // Copy to permanent
            var copyOperation = await permanentBlobClient.StartCopyFromUriAsync(tempBlobClient.Uri);
            await copyOperation.WaitForCompletionAsync();

            // Delete from temp
            await tempBlobClient.DeleteAsync();

            logger.LogInformation("Blob promoted: {BlobName}", blobName);
            return $"{permanentContainerClient.Uri}/{blobName}";
        }

        throw new FileNotFoundException($"Temp blob with ID {fileId} not found.");
    }

    public async Task DeleteExpiredTempFilesAsync(TimeSpan retentionPeriod)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(tempContainer);
        var expirationTime = DateTimeOffset.UtcNow.Subtract(retentionPeriod);

        var blobs = containerClient.GetBlobsAsync();
        await foreach (var blobItem in blobs)
        {
            if (blobItem.Properties.LastModified < expirationTime)
            {
                var blobClient = containerClient.GetBlobClient(blobItem.Name);
                await blobClient.DeleteAsync();
                logger.LogInformation("Deleted expired temp blob: {BlobName}", blobItem.Name);
            }
        }
    }

    public Task<bool> MigrateFileAsync(Guid fileId, StorageProviderEnum fromProvider, StorageProviderEnum toProvider)
    {
        // Azure storage doesn't support migration to other providers
        // Migration should be handled by FallbackFileStorageService
        return Task.FromResult(false);
    }

    public async Task<(string fileName, Stream stream)?> GetPermanentFileAsync(Guid fileId)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(permanentContainer);
        var blobs = containerClient.GetBlobsAsync(prefix: fileId.ToString());
        await foreach (var blobItem in blobs)
        {
            var blobClient = containerClient.GetBlobClient(blobItem.Name);
            var downloadResponse = await blobClient.DownloadAsync();
            return (blobItem.Name, downloadResponse.Value.Content);
        }
        return null;
    }

    public async Task UploadPermanentAsync(string fileName, Stream stream)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(permanentContainer);
        var blobClient = containerClient.GetBlobClient(fileName);
        await blobClient.UploadAsync(stream, overwrite: true);
    }

    public async Task DeletePermanentAsync(Guid fileId)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(permanentContainer);
        var blobs = containerClient.GetBlobsAsync(prefix: fileId.ToString());
        await foreach (var blobItem in blobs)
        {
            var blobClient = containerClient.GetBlobClient(blobItem.Name);
            await blobClient.DeleteIfExistsAsync();
        }
    }
}
