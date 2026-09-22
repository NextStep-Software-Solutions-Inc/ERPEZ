using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.ApproveContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.CancelContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.CreateContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.DeleteContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.GenerateContractDocument;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.ReturnContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.SubmitContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.UpdateContract;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetAvailableNoasForContract;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractById;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractPdf;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContracts;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractSummary;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Manages Contract lifecycle, internal reviews, approvals, returns, cancellations, and queries.
/// </summary>
[Route("contracts")]
[ApiController]
[Authorize]
public class ContractsController(ISender mediator, ICurrentUserService? currentUserService = null) : ControllerBase
{
    private string GetCurrentActorName()
    {
        return !string.IsNullOrWhiteSpace(currentUserService?.Name)
            ? currentUserService.Name
            : (!string.IsNullOrWhiteSpace(currentUserService?.Username) ? currentUserService.Username : "Procurement User");
    }
    /// <summary>
    /// Get paginated list of contracts with Sieve filtering, sorting, and status filter.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<ContractListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetContracts([FromQuery] GetContractsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get aggregate statistics and summary metrics for the contracts workspace.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<ContractSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var result = await mediator.Send(new GetContractSummaryQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get approved Notice of Awards eligible for new contract creation (not linked to an active contract).
    /// </summary>
    [HttpGet("available-noas")]
    [ProducesResponseType(typeof(ApiResponse<List<AvailableNoaForContractDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableNoas()
    {
        var result = await mediator.Send(new GetAvailableNoasForContractQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get single contract detail by ID including linked NOA, items, and audit metadata.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ContractDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await mediator.Send(new GetContractByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Create a new Contract in Draft status linked to an approved Notice of Award.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateContractCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Update header details of a Draft or Returned Contract.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateContractCommand command)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Submit a Draft or Returned Contract for internal review and approval.
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Submit(Guid id)
    {
        var result = await mediator.Send(new SubmitContractCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Approve a Contract under review (internal approving authority).
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(Guid id, [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] ApproveContractCommand? command = null)
    {
        var cmd = (command ?? new ApproveContractCommand()) with { Id = id };
        var result = await mediator.Send(cmd);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Return a Contract under review for revision with remarks.
    /// </summary>
    [HttpPost("{id:guid}/return")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Return(Guid id, [FromBody] ReturnContractCommand command)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Cancel an active Contract (Draft, ForApproval, Returned, or Approved).
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var result = await mediator.Send(new CancelContractCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a Contract in Draft or Returned status.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await mediator.Send(new DeleteContractCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Generate and persist official Contract Agreement PDF document
    /// </summary>
    [HttpPost("{id:guid}/generate-document")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateDocument(Guid id)
    {
        var actorName = GetCurrentActorName();
        var command = new GenerateContractDocumentCommand
        {
            ContractId = id,
            GeneratedBy = actorName
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Stream official server-rendered Contract Agreement PDF directly (inline preview / download)
    /// </summary>
    [HttpGet("{id:guid}/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPdf(Guid id)
    {
        var query = new GetContractPdfQuery(id);
        var result = await mediator.Send(query);
        if (!result.Succeeded || result.Data == null)
        {
            return NotFound(result);
        }

        Response.Headers["Content-Disposition"] = $"inline; filename=\"{result.Data.FileName}\"";
        return File(result.Data.FileBytes, result.Data.ContentType, result.Data.FileName);
    }
}
