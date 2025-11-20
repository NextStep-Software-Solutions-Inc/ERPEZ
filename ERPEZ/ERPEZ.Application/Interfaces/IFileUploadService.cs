using Microsoft.AspNetCore.Http;

namespace ERPEZ.Application.Interfaces;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(IFormFile file, string folder = "uploads", CancellationToken cancellationToken = default);
}