using ERPEZ.Application.Features.Planning.Supplier.Commands.CreateSupplier;
using ERPEZ.Application.Features.Planning.Supplier.Commands.DeleteSupplier;
using ERPEZ.Application.Features.Planning.Supplier.Commands.UpdateSupplier;
using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Application.Features.Planning.Supplier.Queries.GetSupplierById;
using ERPEZ.Application.Features.Planning.Supplier.Queries.GetSuppliers;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("suppliers")]
[ApiController]
public class SupplierController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new supplier/merchant profile
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
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
    [ProducesResponseType(typeof(PaginatedApiResponse<SupplierResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSuppliers([FromQuery] SieveModel sieveModel)
    {
        var query = new GetSuppliersQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get supplier by ID with full profile including the supplierRequirements array
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SupplierDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SupplierDetailedResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSupplierById(Guid id)
    {
        var query = new GetSupplierByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update supplier details and requirement verification statuses
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
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
    /// Delete a supplier from the registry
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSupplier(Guid id)
    {
        var command = new DeleteSupplierCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
