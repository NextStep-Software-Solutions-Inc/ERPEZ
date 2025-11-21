using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("files")]
[ApiController]
public class FilesController(IFileStorageService fileStorageService) : ControllerBase
{
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
}
