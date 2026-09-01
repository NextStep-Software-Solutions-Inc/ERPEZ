using ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetBidNoticeDownloadUrl;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicApplicationStatus;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectDetail;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjects;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectStats;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Public-facing controller for BAC Procurement Opportunities, Project Details, Bid Notices, and Supplier Applications.
/// </summary>
[Route("api/public")]
[ApiController]
[AllowAnonymous]
public class PublicProjectsController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get aggregated metrics for public procurement opportunities (Active, Public Bidding, SVP, Closing Soon, Closed).
    /// </summary>
    [HttpGet("projects/stats")]
    [ProducesResponseType(typeof(ApiResponse<PublicProjectStatsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectStats()
    {
        var result = await mediator.Send(new GetPublicProjectStatsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get paginated list of public procurement projects.
    /// </summary>
    [HttpGet("projects")]
    [ProducesResponseType(typeof(PaginatedApiResponse<PublicProjectListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjects([FromQuery] GetPublicProjectsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get detailed information for a single public project including document checklists and bid notices.
    /// </summary>
    [HttpGet("projects/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PublicProjectDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectById(Guid id)
    {
        var result = await mediator.Send(new GetPublicProjectDetailQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get download URL for a project bid notice template.
    /// </summary>
    [HttpGet("projects/{id:guid}/bid-notices/{checklistItemId:guid}/download")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBidNoticeDownloadUrl(Guid id, Guid checklistItemId)
    {
        var result = await mediator.Send(new GetBidNoticeDownloadUrlQuery(id, checklistItemId));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Submit a public supplier application with required documents for a procurement project.
    /// </summary>
    [HttpPost("projects/{id:guid}/apply")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitApplication(Guid id, [FromBody] SubmitPublicApplicationRequest request)
    {
        var command = new SubmitPublicApplicationCommand(
            id,
            request.CompanyName,
            request.ContactPerson,
            request.EmailAddress,
            request.ContactNumber,
            request.TinNumber,
            request.BusinessAddress,
            request.Documents.Select(d => new ApplicationDocumentUploadItem(d.ChecklistItemId, d.FileId)).ToList()
        );

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Check application submission and review status.
    /// </summary>
    [HttpGet("applications/{id:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse<PublicApplicationStatusDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetApplicationStatus(Guid id)
    {
        var result = await mediator.Send(new GetPublicApplicationStatusQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
