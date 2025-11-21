using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Interfaces;

public interface IFileStorageService
{
    Task<Guid> UploadTempAsync(Stream stream, string fileName);
    Task<string> PromoteFileAsync(Guid fileId);
    Task DeleteExpiredTempFilesAsync(TimeSpan retentionPeriod);
    Task<bool> MigrateFileAsync(Guid fileId, StorageProviderEnum fromProvider, StorageProviderEnum toProvider);
    Task<(string fileName, Stream stream)?> GetPermanentFileAsync(Guid fileId);
    Task UploadPermanentAsync(string fileName, Stream stream);
    Task DeletePermanentAsync(Guid fileId);
}
