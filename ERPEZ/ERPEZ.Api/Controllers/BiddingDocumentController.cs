using ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.CreateDocumentProfile;
using ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.DeleteDocumentProfile;
using ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.UpdateDocumentProfile;
using ERPEZ.Application.Features.Procurement.DocumentProfile.Dtos;
using ERPEZ.Application.Features.Procurement.DocumentProfile.Queries.GetDocumentProfileById;
using ERPEZ.Application.Features.Procurement.DocumentProfile.Queries.GetDocumentProfiles;
using ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.CreateMasterDocumentType;
using ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.DeleteMasterDocumentType;
using ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.UpdateMasterDocumentType;
using ERPEZ.Application.Features.Procurement.MasterDocumentType.Dtos;
using ERPEZ.Application.Features.Procurement.MasterDocumentType.Queries.GetMasterDocumentTypeById;
using ERPEZ.Application.Features.Procurement.MasterDocumentType.Queries.GetMasterDocumentTypes;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("admin/bidding-documents")]
[ApiController]
public class BiddingDocumentController(ISender mediator) : ControllerBase
{
    // ── Master Library ────────────────────────────────────────────────────────

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateMasterDocumentType(
        [FromBody] CreateMasterDocumentTypeCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetMasterDocumentTypeById),
                new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<MasterDocumentTypeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMasterDocumentTypes(
        [FromQuery] GetMasterDocumentTypesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(query, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<MasterDocumentTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMasterDocumentTypeById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetMasterDocumentTypeByIdQuery(id), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMasterDocumentType(
        Guid id,
        [FromBody] UpdateMasterDocumentTypeCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command with { Id = id }, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteMasterDocumentType(
        Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteMasterDocumentTypeCommand(id), cancellationToken);
        return result.Succeeded ? NoContent() : NotFound(result);
    }

    // ── Checklist Profiles ────────────────────────────────────────────────────

    [HttpPost("profiles")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDocumentProfile(
        [FromBody] CreateDocumentProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetDocumentProfileById),
                new { profileId = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet("profiles")]
    [ProducesResponseType(typeof(PaginatedApiResponse<DocumentProfileDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocumentProfiles(
        [FromQuery] GetDocumentProfilesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(query, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("profiles/{profileId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DocumentProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDocumentProfileById(
        Guid profileId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetDocumentProfileByIdQuery(profileId), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("profiles/{profileId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDocumentProfile(
        Guid profileId,
        [FromBody] UpdateDocumentProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command with { Id = profileId }, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("profiles/{profileId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDocumentProfile(
        Guid profileId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new DeleteDocumentProfileCommand(profileId), cancellationToken);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}