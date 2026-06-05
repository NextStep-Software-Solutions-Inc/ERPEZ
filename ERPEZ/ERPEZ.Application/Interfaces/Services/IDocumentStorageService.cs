namespace ERPEZ.Application.Interfaces.Services;

public interface IDocumentStorageService
{
    Task<string>  SaveAsync(byte[] content, string fileName, CancellationToken cancellationToken = default);
    Task<byte[]>  GetAsync(string storagePath, CancellationToken cancellationToken = default);
}