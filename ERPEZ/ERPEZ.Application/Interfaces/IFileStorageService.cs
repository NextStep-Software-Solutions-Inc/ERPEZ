namespace ERPEZ.Application.Interfaces;

public interface IFileStorageService
{
    Task<Guid> UploadTempAsync(Stream stream, string fileName);
    Task<string> PromoteFileAsync(Guid fileId);
    Task DeleteExpiredTempFilesAsync(TimeSpan retentionPeriod);
}
