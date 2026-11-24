using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectContractings.Commands.SubmitDirectContractingProposal;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetSupplierDirectContractingById;
using ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetSupplierDirectContractings;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Manages Supplier Portal operations for viewing Direct Contracting invitations and submitting proposals
/// </summary>
[Route("api/supplier/direct-contracting")]
[ApiController]
[Authorize]
public class SupplierDirectContractingController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get direct contracting invitations for a supplier
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<DirectContractingResponse>>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.supplierView)]
    public async Task<IActionResult> GetSupplierDirectContractings([FromQuery] Guid? supplierId = null)
    {
        var result = await mediator.Send(new GetSupplierDirectContractingsQuery(supplierId ?? Guid.Empty));
        return Ok(result);
    }

    /// <summary>
    /// Get details of a direct contracting invitation for a supplier
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DirectContractingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.supplierView)]
    public async Task<IActionResult> GetSupplierDirectContractingById(Guid id, [FromQuery] Guid? supplierId = null)
    {
        var result = await mediator.Send(new GetSupplierDirectContractingByIdQuery(id, supplierId ?? Guid.Empty));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Submit a supplier proposal for a direct contracting request
    /// </summary>
    [HttpPost("{id:guid}/proposal")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.supplierManage)]
    public async Task<IActionResult> SubmitProposal(Guid id, [FromBody] SubmitDirectContractingProposalRequest request)
    {
        var result = await mediator.Send(new SubmitDirectContractingProposalCommand { DirectContractingId = id, Request = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
