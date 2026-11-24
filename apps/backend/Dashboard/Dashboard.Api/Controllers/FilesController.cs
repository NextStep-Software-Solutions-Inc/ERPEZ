using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace ERPEZ.Api.Controllers;

[Route("files")]
[ApiController]
[Authorize]
public class FilesController(IFileStorageService fileStorageService) : ControllerBase
{
    private static readonly HashSet<string> allowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".jpg", ".jpeg", ".png", ".gif", ".zip"
    };

    private const long maxFileSizeBytes = 25 * 1024 * 1024; // 25 MB

    /// <summary>
    /// Authenticated upload endpoint for internal application attachments.
    /// </summary>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<Guid>.Fail("No file provided."));

        if (file.Length > maxFileSizeBytes)
            return BadRequest(ApiResponse<Guid>.Fail($"File size exceeds the maximum limit of {maxFileSizeBytes / (1024 * 1024)}MB."));

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            return BadRequest(ApiResponse<Guid>.Fail("Unsupported file type."));

        using var stream = file.OpenReadStream();
        var fileId = await fileStorageService.UploadTempAsync(stream, file.FileName);

        return Ok(ApiResponse<Guid>.Success(fileId, "File uploaded successfully."));
    }

    /// <summary>
    /// Delete a temporary uploaded file to prevent storage exhaustion on failed or cancelled forms.
    /// </summary>
    [HttpDelete("temp/{fileId:guid}")]
    [HttpDelete("{fileId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteTempFile(Guid fileId, CancellationToken cancellationToken)
    {
        await fileStorageService.DeleteTempFileAsync(fileId, cancellationToken);
        return Ok(ApiResponse<bool>.Success(true, "Temporary file deleted successfully."));
    }

    /// <summary>
    /// Public upload endpoint dedicated for unauthenticated portal submissions (e.g., BAC supplier applications).
    /// </summary>
    [AllowAnonymous]
    [HttpPost("public/upload")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PublicUpload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<Guid>.Fail("No file provided."));

        if (file.Length > maxFileSizeBytes)
            return BadRequest(ApiResponse<Guid>.Fail($"File size exceeds the maximum limit of {maxFileSizeBytes / (1024 * 1024)}MB."));

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            return BadRequest(ApiResponse<Guid>.Fail("Unsupported file type."));

        using var stream = file.OpenReadStream();
        var fileId = await fileStorageService.UploadTempAsync(stream, file.FileName);

        return Ok(ApiResponse<Guid>.Success(fileId, "File uploaded successfully."));
    }

    /// <summary>
    /// Generates a short-lived pre-signed (SAS) download URL for direct access to cloud storage.
    /// </summary>
    [HttpGet("{fileId}/download-url")]
    [HttpGet("download/{fileId}/url")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDownloadUrl(Guid fileId, [FromQuery] int expiryMinutes = 30)
    {
        var duration = TimeSpan.FromMinutes(Math.Clamp(expiryMinutes, 5, 120));
        var downloadUrl = await fileStorageService.GetDownloadUrlAsync(fileId, duration);

        return Ok(ApiResponse<object>.Success(new
        {
            FileId = fileId,
            Url = downloadUrl,
            ExpiresAt = DateTimeOffset.UtcNow.Add(duration)
        }));
    }

    /// <summary>
    /// Authenticated proxy download stream.
    /// </summary>
    [HttpGet("download/{fileId}")]
    [HttpGet("{fileId}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(Guid fileId)
    {
        var fileInfo = await fileStorageService.GetFileAsync(fileId);
        if (fileInfo == null)
            return NotFound(ApiResponse<object>.Fail("File not found."));

        var (fileName, stream) = fileInfo.Value;
        
        var underscoreIndex = fileName.IndexOf('_');
        var displayName = underscoreIndex >= 0
            ? fileName[(underscoreIndex + 1)..]
            : fileName;

        var contentType = GetContentType(fileName);
        Response.Headers["Content-Disposition"] = 
            $"inline; filename=\"{displayName}\"";
        Response.Headers["Access-Control-Expose-Headers"] = "Content-Disposition";
        return File(stream, contentType);
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".txt" => "text/plain",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };
    }
}
