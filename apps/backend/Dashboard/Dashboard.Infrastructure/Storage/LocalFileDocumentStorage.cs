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
        var dateFolder = DateTime.UtcNow.ToString("yyyy/MM/dd");
        var directory = Path.Combine(RootPath, dateFolder);
        Directory.CreateDirectory(directory);

        // Sanitize fileName to prevent invalid path characters
        var safeFileName = string.Join("_", fileName.Split(Path.GetInvalidFileNameChars()));
        var ext = Path.GetExtension(safeFileName);
        var baseName = Path.GetFileNameWithoutExtension(safeFileName);

        var finalFileName = safeFileName;
        var fullPath = Path.Combine(directory, finalFileName);

        // If file already exists, avoid collision by appending a unique short guid
        if (File.Exists(fullPath))
        {
            finalFileName = $"{baseName}_{Guid.NewGuid():N[..8]}{ext}";
            fullPath = Path.Combine(directory, finalFileName);
        }

        try
        {
            await using var stream = new FileStream(
                fullPath,
                FileMode.Create,
                FileAccess.Write,
                FileShare.ReadWrite | FileShare.Delete,
                bufferSize: 4096,
                useAsync: true);

            await stream.WriteAsync(content, cancellationToken);
        }
        catch (IOException)
        {
            // If the file is locked by an external process (e.g., PDF viewer), write to a guaranteed unique filename
            finalFileName = $"{baseName}_{Guid.NewGuid():N}{ext}";
            fullPath = Path.Combine(directory, finalFileName);

            await using var fallbackStream = new FileStream(
                fullPath,
                FileMode.Create,
                FileAccess.Write,
                FileShare.ReadWrite | FileShare.Delete,
                bufferSize: 4096,
                useAsync: true);

            await fallbackStream.WriteAsync(content, cancellationToken);
        }

        var relativePath = Path.Combine(dateFolder, finalFileName).Replace('\\', '/');
        return relativePath;
    }

    public async Task<byte[]> GetAsync(
        string            storagePath,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(RootPath, storagePath);

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"Document file not found at path: {storagePath}", fullPath);
        }

        // Open with FileShare.ReadWrite to never lock out other readers or writers
        await using var stream = new FileStream(
            fullPath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.ReadWrite | FileShare.Delete,
            bufferSize: 4096,
            useAsync: true);

        using var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream, cancellationToken);
        return memoryStream.ToArray();
    }
}