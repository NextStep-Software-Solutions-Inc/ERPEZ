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
    }

    public async Task<Guid> UploadTempAsync(Stream stream, string fileName, CancellationToken cancellationToken = default)
    {
        var fileId = Guid.NewGuid();
        var extension = Path.GetExtension(fileName);
        var baseName = Path.GetFileNameWithoutExtension(fileName);
        var blobName = $"{fileId}_{baseName}{extension}";

        var containerClient = blobServiceClient.GetBlobContainerClient(tempContainer);
        var blobClient = containerClient.GetBlobClient(blobName);

        await blobClient.UploadAsync(stream, overwrite: true, cancellationToken);
        logger.LogInformation("Blob uploaded to temp: {BlobName}", blobName);
        return fileId;
    }

    public async Task<(string Url, string OriginalFileName)> PromoteFileAsync(Guid fileId, CancellationToken cancellationToken = default)
    {
        var tempContainerClient = blobServiceClient.GetBlobContainerClient(tempContainer);
        var permanentContainerClient = blobServiceClient.GetBlobContainerClient(permanentContainer);

        var blobs = tempContainerClient.GetBlobsAsync(prefix: fileId.ToString(), cancellationToken: cancellationToken);
        await foreach (var blobItem in blobs.WithCancellation(cancellationToken))
        {
            var blobName = blobItem.Name;
            var tempBlobClient = tempContainerClient.GetBlobClient(blobName);
            var permanentBlobClient = permanentContainerClient.GetBlobClient(blobName);

            // Copy to permanent
            var copyOperation = await permanentBlobClient.StartCopyFromUriAsync(tempBlobClient.Uri, cancellationToken: cancellationToken);
            await copyOperation.WaitForCompletionAsync(cancellationToken);

            // Delete from temp
            await tempBlobClient.DeleteAsync(cancellationToken: cancellationToken);

            logger.LogInformation("Blob promoted: {BlobName}", blobName);

            var prefix = $"{fileId}_";
            var originalFileName = blobName.StartsWith(prefix, StringComparison.Ordinal)
                ? blobName[prefix.Length..]
                : blobName;

            return ($"/files/download/{fileId}", originalFileName);
        }

        // Check if file is already promoted in permanent container
        var permanentBlobs = permanentContainerClient.GetBlobsAsync(prefix: fileId.ToString(), cancellationToken: cancellationToken);
        await foreach (var blobItem in permanentBlobs.WithCancellation(cancellationToken))
        {
            var prefix = $"{fileId}_";
            var originalFileName = blobItem.Name.StartsWith(prefix, StringComparison.Ordinal)
                ? blobItem.Name[prefix.Length..]
                : blobItem.Name;

            return ($"/files/download/{fileId}", originalFileName);
        }

        throw new FileNotFoundException($"Temp blob with ID {fileId} not found.");
    }

    public async Task DeleteExpiredTempFilesAsync(TimeSpan retentionPeriod, CancellationToken cancellationToken = default)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(tempContainer);
        var expirationTime = DateTimeOffset.UtcNow.Subtract(retentionPeriod);

        var blobs = containerClient.GetBlobsAsync(cancellationToken: cancellationToken);
        await foreach (var blobItem in blobs.WithCancellation(cancellationToken))
        {
            if (blobItem.Properties.LastModified < expirationTime)
            {
                var blobClient = containerClient.GetBlobClient(blobItem.Name);
                await blobClient.DeleteAsync(cancellationToken: cancellationToken);
                logger.LogInformation("Deleted expired temp blob: {BlobName}", blobItem.Name);
            }
        }
    }

    public Task<bool> MigrateFileAsync(Guid fileId, StorageProviderEnum fromProvider, StorageProviderEnum toProvider, CancellationToken cancellationToken = default)
    {
        // Azure storage doesn't support migration to other providers
        // Migration should be handled by FallbackFileStorageService
        return Task.FromResult(false);
    }

    public async Task<(string fileName, Stream stream)?> GetFileAsync(Guid fileId, CancellationToken cancellationToken = default)
    {
        var permanentResult = await GetPermanentFileAsync(fileId, cancellationToken);
        if (permanentResult != null) return permanentResult;

        var containerClient = blobServiceClient.GetBlobContainerClient(tempContainer);
        var blobs = containerClient.GetBlobsAsync(prefix: fileId.ToString(), cancellationToken: cancellationToken);
        await foreach (var blobItem in blobs.WithCancellation(cancellationToken))
        {
            var blobClient = containerClient.GetBlobClient(blobItem.Name);
            var downloadResponse = await blobClient.DownloadAsync(cancellationToken);
            return (blobItem.Name, downloadResponse.Value.Content);
        }

        return null;
    }

    public async Task<(string fileName, Stream stream)?> GetPermanentFileAsync(Guid fileId, CancellationToken cancellationToken = default)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(permanentContainer);
        var blobs = containerClient.GetBlobsAsync(prefix: fileId.ToString(), cancellationToken: cancellationToken);
        await foreach (var blobItem in blobs.WithCancellation(cancellationToken))
        {
            var blobClient = containerClient.GetBlobClient(blobItem.Name);
            var downloadResponse = await blobClient.DownloadAsync(cancellationToken);
            return (blobItem.Name, downloadResponse.Value.Content);
        }
        return null;
    }

    public async Task UploadPermanentAsync(string fileName, Stream stream, CancellationToken cancellationToken = default)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(permanentContainer);
        var blobClient = containerClient.GetBlobClient(fileName);
        await blobClient.UploadAsync(stream, overwrite: true, cancellationToken);
    }

    public async Task DeletePermanentAsync(Guid fileId, CancellationToken cancellationToken = default)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(permanentContainer);
        var blobs = containerClient.GetBlobsAsync(prefix: fileId.ToString(), cancellationToken: cancellationToken);
        await foreach (var blobItem in blobs.WithCancellation(cancellationToken))
        {
            var blobClient = containerClient.GetBlobClient(blobItem.Name);
            await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
        }
    }
}
