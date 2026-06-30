using ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetBidNoticeDownloadUrl;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectDetail;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectStats;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjects;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicApplicationStatus;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[AllowAnonymous]
[Route("api/public/projects")]
[ApiController]
public class SupplierPortalController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PublicProjectListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjects(
        [FromQuery] SieveModel sieveModel,
        [FromQuery] string? search,
        [FromQuery] string? mode,
        [FromQuery] string? status)
    {
        var extraFilters = new List<string>();

        if (!string.IsNullOrWhiteSpace(search))
            extraFilters.Add($"Title@={search}|ContractNo@={search}");

        if (!string.IsNullOrWhiteSpace(mode))
            extraFilters.Add($"ProcurementMode.Name=={mode}");

        if (!string.IsNullOrWhiteSpace(status))
            extraFilters.Add($"Status=={status}");

        var combinedFilters = string.IsNullOrWhiteSpace(sieveModel.Filters)
            ? string.Join(",", extraFilters)
            : string.Join(",", new[] { sieveModel.Filters }.Concat(extraFilters));

        var query = new GetPublicProjectsQuery
        {
            PageNumber = sieveModel.Page ?? 1,
            PageSize   = sieveModel.PageSize ?? 10,
            Filters    = string.IsNullOrWhiteSpace(combinedFilters) ? null : combinedFilters,
            Sorts      = sieveModel.Sorts
        };

        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<PublicProjectStatsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var result = await mediator.Send(new GetPublicProjectStatsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PublicProjectDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectById(Guid id)
    {
        var result = await mediator.Send(new GetPublicProjectDetailQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("{id:guid}/bid-notices/{checklistItemId:guid}/download")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadBidNotice(Guid id, Guid checklistItemId)
    {
        var result = await mediator.Send(new GetBidNoticeDownloadUrlQuery(id, checklistItemId));
        return result.Succeeded ? Redirect(result.Data!) : NotFound(result);
    }

    [HttpPost("{id:guid}/apply")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Apply(Guid id, [FromBody] SubmitPublicApplicationRequest request)
    {
        var command = new SubmitPublicApplicationCommand(
            id,
            request.CompanyName,
            request.ContactPerson,
            request.EmailAddress,
            request.ContactNumber,
            request.TinNumber,
            request.BusinessAddress,
            request.Documents);

        var result = await mediator.Send(command);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetProjectById), new { id }, result)
            : BadRequest(result);
    }

    [HttpGet("/api/public/applications/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PublicApplicationStatusDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetApplicationStatus(Guid id)
    {
        var result = await mediator.Send(new GetPublicApplicationStatusQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}

public record SubmitPublicApplicationRequest(
    string CompanyName,
    string ContactPerson,
    string EmailAddress,
    string ContactNumber,
    string TinNumber,
    string BusinessAddress,
    List<ApplicationDocumentUploadItem> Documents);