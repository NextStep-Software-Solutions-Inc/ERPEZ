using ERPEZ.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string tempPath;
    private readonly string permanentPath;
    private readonly ILogger<LocalFileStorageService> logger;

    public LocalFileStorageService(ILogger<LocalFileStorageService> logger)
    {
        this.logger = logger;
        var rootPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        tempPath = Path.Combine(rootPath, "temp");
        permanentPath = Path.Combine(rootPath, "permanent");

        if (!Directory.Exists(tempPath)) Directory.CreateDirectory(tempPath);
        if (!Directory.Exists(permanentPath)) Directory.CreateDirectory(permanentPath);
    }

    public async Task<Guid> UploadTempAsync(Stream stream, string fileName)
    {
        var fileId = Guid.NewGuid();
        var extension = Path.GetExtension(fileName);
        var baseName = Path.GetFileNameWithoutExtension(fileName);
        var tempFileName = $"{baseName}_{fileId}{extension}";
        var filePath = Path.Combine(tempPath, tempFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await stream.CopyToAsync(fileStream);
        }

        logger.LogInformation("File uploaded to temp: {FileId} - {FileName}", fileId, tempFileName);
        return fileId;
    }

    public Task<string> PromoteFileAsync(Guid fileId)
    {
        var searchPattern = $"{fileId}*";
        var files = Directory.GetFiles(tempPath, searchPattern);
        
        if (files.Length == 0)
        {
            logger.LogWarning("File not found in temp storage: {FileId}", fileId);
            throw new FileNotFoundException($"Temp file with ID {fileId} not found.");
        }

        var tempFilePath = files[0];
        var fileName = Path.GetFileName(tempFilePath);
        var permanentFilePath = Path.Combine(permanentPath, fileName);

        if (File.Exists(permanentFilePath))
        {
             // If it already exists in permanent, we might just return the path or overwrite.
             // For now, let's assume we just return the existing one or overwrite.
             // But since it's a GUID based name, collision is unlikely unless promoted twice.
        }

        File.Move(tempFilePath, permanentFilePath);
        logger.LogInformation("File promoted to permanent: {FileName}", fileName);

        // Return relative path or URL
        return Task.FromResult(Path.Combine("uploads", "permanent", fileName).Replace("\\", "/"));
    }

    public Task DeleteExpiredTempFilesAsync(TimeSpan retentionPeriod)
    {
        var expirationTime = DateTime.UtcNow.Subtract(retentionPeriod);
        var files = Directory.GetFiles(tempPath);

        foreach (var file in files)
        {
            var creationTime = File.GetCreationTimeUtc(file);
            if (creationTime < expirationTime)
            {
                try
                {
                    File.Delete(file);
                    logger.LogInformation("Deleted expired temp file: {FileName}", Path.GetFileName(file));
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error deleting expired temp file: {FileName}", Path.GetFileName(file));
                }
            }
        }

        return Task.CompletedTask;
    }
}
