using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[ApiController]
[Route("agency")]
[Authorize]
public class AgencyController(IAgencyLetterheadService letterheadService) : ControllerBase
{
    private static readonly HashSet<string> allowedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".png", ".jpg", ".jpeg"
    };

    private const long maxLogoSizeBytes = 5 * 1024 * 1024; // 5 MB

    [HttpGet("letterhead")]
    [ProducesResponseType(typeof(ApiResponse<AgencyLetterheadDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLetterhead(CancellationToken cancellationToken)
    {
        var result = await letterheadService.GetLetterheadAsync(cancellationToken);
        return Ok(ApiResponse<AgencyLetterheadDto>.Success(result));
    }

    [HttpGet("logo")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLogo(CancellationToken cancellationToken)
    {
        var logoBytes = await letterheadService.GetLogoAsync(cancellationToken);
        if (logoBytes == null || logoBytes.Length == 0)
        {
            return NotFound(ApiResponse<object>.Fail("No agency logo configured."));
        }

        return File(logoBytes, "image/png");
    }

    [HttpPut("letterhead")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<AgencyLetterheadDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateLetterhead(
        [FromBody] UpdateAgencyLetterheadBody body,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(body.Name))
        {
            return BadRequest(ApiResponse<AgencyLetterheadDto>.Fail("Agency Name is required."));
        }

        var updateRequest = new UpdateAgencyLetterheadRequest
        {
            Name = body.Name,
            Address = body.Address ?? string.Empty,
            UpdateLogo = false
        };

        var result = await letterheadService.UpdateLetterheadAsync(updateRequest, cancellationToken);
        return Ok(ApiResponse<AgencyLetterheadDto>.Success(result, "Agency letterhead updated successfully."));
    }

    [HttpPost("logo")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<AgencyLetterheadDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadLogo(IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<AgencyLetterheadDto>.Fail("No image file provided."));
        }

        if (file.Length > maxLogoSizeBytes)
        {
            return BadRequest(ApiResponse<AgencyLetterheadDto>.Fail($"Logo image size exceeds maximum permitted limit of {maxLogoSizeBytes / 1024} KB."));
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension) || !allowedImageExtensions.Contains(extension))
        {
            return BadRequest(ApiResponse<AgencyLetterheadDto>.Fail("Unsupported file type. Please upload a PNG or JPEG image."));
        }

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms, cancellationToken);
        var bytes = ms.ToArray();

        var current = await letterheadService.GetLetterheadAsync(cancellationToken);
        var updateRequest = new UpdateAgencyLetterheadRequest
        {
            Name = !string.IsNullOrWhiteSpace(current.Name) ? current.Name : "Agency Name",
            Address = current.Address,
            LogoBytes = bytes,
            UpdateLogo = true
        };

        var result = await letterheadService.UpdateLetterheadAsync(updateRequest, cancellationToken);
        return Ok(ApiResponse<AgencyLetterheadDto>.Success(result, "Agency logo uploaded successfully."));
    }

    [HttpDelete("logo")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearLogo(CancellationToken cancellationToken)
    {
        await letterheadService.ClearLogoAsync(cancellationToken);
        return Ok(ApiResponse<bool>.Success(true, "Agency logo removed successfully."));
    }
}

public class UpdateAgencyLetterheadBody
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
}
