using System.Security.Claims;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateLibRealignmentPdf;
using ERPEZ.Application.Features.Planning.Document.Queries.GetLibRealignmentPdf;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[ApiController]
[Route("api/planning/lib-realignments")]
[Authorize]
public class LibRealignmentsController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Generates and persists the official Modification of Budget PDF document (FM-USTP-FDP-002).
    /// </summary>
    [HttpPost("{id:guid}/generate")]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GeneratePdf(
        Guid id,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var (_, actorName) = GetCurrentActor();
        var command = new GenerateLibRealignmentPdfCommand
        {
            RealignmentId = id,
            Format = format,
            GeneratedBy = actorName
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Directly streams the server-rendered Modification of Budget PDF document (FM-USTP-FDP-002) for preview.
    /// </summary>
    [HttpGet("{id:guid}/pdf")]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPdf(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var (bytes, contentType, fileName) = await mediator.Send(new GetLibRealignmentPdfQuery(id), cancellationToken);
        Response.Headers["Content-Disposition"] = $"inline; filename=\"{fileName}\"";
        return File(bytes, contentType, fileName);
    }

    private (Guid actorId, string actorName) GetCurrentActor()
    {
        var idClaim = User.FindFirst("sub")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var nameClaim = User.FindFirst("name")?.Value
            ?? User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.Identity?.Name
            ?? "system";

        Guid.TryParse(idClaim, out var actorId);
        return (actorId, nameClaim);
    }
}
