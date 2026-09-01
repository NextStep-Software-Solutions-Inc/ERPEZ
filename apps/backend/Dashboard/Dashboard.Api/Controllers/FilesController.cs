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
    [AllowAnonymous]
    [HttpPost("upload")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<Guid>.Fail("No file provided."));

        using var stream = file.OpenReadStream();
        var fileId = await fileStorageService.UploadTempAsync(stream, file.FileName);

        return Ok(ApiResponse<Guid>.Success(fileId, "File uploaded successfully."));
    }

    [AllowAnonymous]
    [HttpGet("download/{fileId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
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
        return File(stream, contentType, displayName);
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
