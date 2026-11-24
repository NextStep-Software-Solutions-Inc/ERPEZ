using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Interfaces;

public interface IFileStorageService
{
    Task<Guid> UploadTempAsync(Stream stream, string fileName, CancellationToken cancellationToken = default);
    Task<(string Url, string OriginalFileName)> PromoteFileAsync(Guid fileId, CancellationToken cancellationToken = default);
    Task DeleteExpiredTempFilesAsync(TimeSpan retentionPeriod, CancellationToken cancellationToken = default);
    Task<bool> MigrateFileAsync(Guid fileId, StorageProviderEnum fromProvider, StorageProviderEnum toProvider, CancellationToken cancellationToken = default);
    Task<(string fileName, Stream stream)?> GetFileAsync(Guid fileId, CancellationToken cancellationToken = default);
    Task<(string fileName, Stream stream)?> GetPermanentFileAsync(Guid fileId, CancellationToken cancellationToken = default);
    Task<string> GetDownloadUrlAsync(Guid fileId, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
    Task UploadPermanentAsync(string fileName, Stream stream, CancellationToken cancellationToken = default);
    Task DeletePermanentAsync(Guid fileId, CancellationToken cancellationToken = default);
    Task DeleteTempFileAsync(Guid fileId, CancellationToken cancellationToken = default);
}
