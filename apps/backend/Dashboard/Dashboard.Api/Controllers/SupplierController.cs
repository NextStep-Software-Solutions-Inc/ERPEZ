using ERPEZ.Application.Features.Planning.Supplier.Commands.CreateSupplier;
using ERPEZ.Application.Features.Planning.Supplier.Commands.CreateSupplierWithRequirements;
using ERPEZ.Application.Features.Planning.Supplier.Commands.DeleteSupplier;
using ERPEZ.Application.Features.Planning.Supplier.Commands.PatchSupplier;
using ERPEZ.Application.Features.Planning.Supplier.Commands.UpdateSupplier;
using ERPEZ.Application.Features.Planning.Supplier.Commands.ValidateSupplier;
using ERPEZ.Application.Features.Planning.Supplier.Commands.VerifySupplierRequirements;
using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Application.Features.Planning.Supplier.Queries.GetSupplierById;
using ERPEZ.Application.Features.Planning.Supplier.Queries.GetSuppliers;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("suppliers")]
[ApiController]
[Authorize]
public class SupplierController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Pre-flight validation for supplier registration/update prior to uploading requirement files.
    /// Prevents storage exhaustion if TIN or Business Permit is duplicated or category is missing.
    /// </summary>
    [HttpPost("validate")]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ValidateSupplier([FromBody] ValidateSupplierRequest request)
    {
        var command = new ValidateSupplierCommand(request);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Create a new supplier/merchant profile
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateSupplier([FromBody] CreateSupplierCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetSupplierById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Get all suppliers with status (Pending/Approved/Declined), Industry Category, and filter by blacklist
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Procurement.supplierView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<SupplierResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSuppliers([FromQuery] SieveModel sieveModel)
    {
        var query = new GetSuppliersQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get supplier by ID with full profile including the supplierRequirements array
    /// </summary>
    [HttpGet("{id}")]
    [HasPermission(Permissions.Procurement.supplierView)]
    [ProducesResponseType(typeof(ApiResponse<SupplierDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SupplierDetailedResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSupplierById(Guid id)
    {
        var query = new GetSupplierByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Patch supplier status, status note, or blocking state.
    /// </summary>
    [HttpPatch("{id}/status")]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> PatchSupplier(Guid id, [FromBody] PatchSupplierRequestDto patchSupplier)
    {
        var command = new PatchSupplierCommand
        {
            Id = id,
            PatchSupplier = patchSupplier
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Update supplier details and requirement verification statuses
    /// </summary>
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateSupplier(Guid id, [FromBody] UpdateSupplierRequest updateSupplier)
    {
        var command = new UpdateSupplierCommand
        {
            Id = id,
            UpdateSupplier = updateSupplier
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Create a new supplier with compliance requirements/documents
    /// </summary>
    [HttpPost("with-requirements")]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateSupplierWithRequirements([FromBody] CreateSupplierWithRequirementsRequest request)
    {
        var command = new CreateSupplierWithRequirementsCommand
        {
            CreateSupplierRequest = request
        };
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetSupplierById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Verify or update verification state for supplier requirements by supplier ID.
    /// </summary>
    [HttpPatch("{id}/requirements")]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> VerifySupplierRequirements(Guid id, [FromBody] VerifySupplierRequirementsRequest request)
    {
        var command = new VerifySupplierRequirementsCommand
        {
            SupplierId = id,
            Requirements = request.Requirements
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a supplier from the registry
    /// </summary>
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteSupplier(Guid id)
    {
        var command = new DeleteSupplierCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
