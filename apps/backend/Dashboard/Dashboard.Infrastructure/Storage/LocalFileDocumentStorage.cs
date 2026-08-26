using ERPEZ.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Infrastructure.Services.DocumentGeneration.Storage;

internal sealed class LocalFileDocumentStorage(IConfiguration configuration) : IDocumentStorageService
{
    private string RootPath =>
        configuration["DocumentStorage:LocalPath"]
        ?? Path.Combine(AppContext.BaseDirectory, "GeneratedDocuments");

    public async Task<string> SaveAsync(
        byte[]            content,
        string            fileName,
        CancellationToken cancellationToken = default)
    {
        var relativePath = Path.Combine(DateTime.UtcNow.ToString("yyyy/MM/dd"), fileName);
        var fullPath     = Path.Combine(RootPath, relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
        await File.WriteAllBytesAsync(fullPath, content, cancellationToken);
        return relativePath;
    }

    public async Task<byte[]> GetAsync(
        string            storagePath,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(RootPath, storagePath);
        return await File.ReadAllBytesAsync(fullPath, cancellationToken);
    }
}