using ERPEZ.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Infrastructure.Services;

public class FileUploadService : IFileUploadService
{
    public async Task<string> UploadFileAsync(IFormFile file, string folder = "uploads", CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is required.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), folder);
        Directory.CreateDirectory(uploadsFolder);

        var baseName = Path.GetFileNameWithoutExtension(file.FileName);
        var extension = Path.GetExtension(file.FileName);
        var uniquePart = Guid.NewGuid().ToString("N")[..8];
        var fileName = $"{baseName}_{uniquePart}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        return $"/{folder}/{fileName}";
    }
}