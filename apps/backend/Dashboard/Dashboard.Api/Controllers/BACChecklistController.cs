using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.AddCustomRequirement;
using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.DeleteChecklistItem;
using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.LoadProfile;
using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.UpdateChecklistItem;
using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Dtos;
using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Queries.GetProjectChecklist;
using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.ConfirmChecklist;
using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.ResetChecklist;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("bac/projects")]
[ApiController]
[Authorize]
public class BACChecklistController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Scaffolds a project checklist from a default profile.
    /// Clears any existing draft items before re-loading.
    /// Rejected if project status is Posted or beyond.
    /// </summary>
    [HttpPost("{projectId:guid}/checklists/load-profile")]
    [HasPermission(Permissions.Procurement.biddingDocumentsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> LoadProfile(
        Guid projectId,
        [FromBody] LoadProfileRequest request,     // ← was LoadProfileCommand
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new LoadProfileCommand
            {
                ProcurementProjectId = projectId,
                DocumentProfileId    = request.DocumentProfileId
            }, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Returns the full project checklist grouped by Envelope 1 and Envelope 2,
    /// ordered by OrderIndex within each envelope.
    /// </summary>
    [HttpGet("{projectId:guid}/checklists")]
    [HasPermission(Permissions.Procurement.biddingDocumentsView)]
    [ProducesResponseType(typeof(ApiResponse<ProjectChecklistResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProjectChecklist(
        Guid projectId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetProjectChecklistQuery(projectId), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Adds a custom, project-specific requirement (e.g. "FDA Certificate for Medical Supplies").
    /// Does NOT insert into the global MasterDocumentType table.
    /// </summary>
    [HttpPost("{projectId:guid}/checklists/custom")]
    [HasPermission(Permissions.Procurement.biddingDocumentsManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AddCustomRequirement(
        Guid projectId,
        [FromBody] AddCustomRequirementRequest request,     // ← was AddCustomRequirementCommand
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new AddCustomRequirementCommand
            {
                ProcurementProjectId = projectId,
                CustomDocumentName   = request.CustomDocumentName,
                EnvelopeType         = request.EnvelopeType,
                OrderIndex           = request.OrderIndex,
                FileId               = request.FileId
            }, cancellationToken);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetProjectChecklist), new { projectId }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Toggles IsRequired or updates OrderIndex (drag-and-drop reorder).
    /// </summary>
    [HttpPut("{projectId:guid}/checklists/{checklistItemId:guid}")]
    [HasPermission(Permissions.Procurement.biddingDocumentsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateChecklistItem(
        Guid projectId,
        Guid checklistItemId,
        [FromBody] UpdateChecklistItemRequest request,     // ← was UpdateChecklistItemCommand
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdateChecklistItemCommand
            {
                ProcurementProjectId = projectId,
                ChecklistItemId      = checklistItemId,
                IsRequired           = request.IsRequired,
                OrderIndex           = request.OrderIndex
            }, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>Removes a checklist item. Only custom items should typically be deleted;
    /// profile-sourced items are toggled off via IsRequired.</summary>
    [HttpDelete("{projectId:guid}/checklists/{checklistItemId:guid}")]
    [HasPermission(Permissions.Procurement.biddingDocumentsManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteChecklistItem(
        Guid projectId,
        Guid checklistItemId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new DeleteChecklistItemCommand(projectId, checklistItemId), cancellationToken);
        return result.Succeeded ? NoContent() : NotFound(result);
    }

    /// <summary>
    /// Locks the checklist — triggers the supplier portal to generate
    /// the exact upload slots matching this checklist.
    /// </summary>
    [HttpPost("{projectId:guid}/checklists/confirm")]
    [HasPermission(Permissions.Procurement.biddingDocumentsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ConfirmChecklist(
        Guid projectId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new ConfirmChecklistCommand(projectId), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Reverts a confirmed checklist back to Draft for editing.
    /// Only allowed if the project has not yet been Posted.
    /// </summary>
    [HttpPost("{projectId:guid}/checklists/reset")]
    [HasPermission(Permissions.Procurement.biddingDocumentsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ResetChecklist(
        Guid projectId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new ResetChecklistCommand(projectId), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}