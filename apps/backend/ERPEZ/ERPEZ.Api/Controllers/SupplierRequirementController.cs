using ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.CreateSupplierRequirement;
using ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.DeleteSupplierRequirement;
using ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.UpdateSupplierRequirement;
using ERPEZ.Application.Features.Planning.SupplierRequirement.Dtos;
using ERPEZ.Application.Features.Planning.SupplierRequirement.Queries.GetSupplierRequirementById;
using ERPEZ.Application.Features.Planning.SupplierRequirement.Queries.GetSupplierRequirements;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("supplier-requirements")]
[ApiController]
public class SupplierRequirementController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new supplier requirement document
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSupplierRequirement([FromBody] CreateSupplierRequirementCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetSupplierRequirementById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Get all supplier requirements with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<SupplierRequirementResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSupplierRequirements([FromQuery] SieveModel sieveModel)
    {
        var query = new GetSupplierRequirementsQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get supplier requirement by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SupplierRequirementResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SupplierRequirementResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSupplierRequirementById(Guid id)
    {
        var query = new GetSupplierRequirementByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update an existing supplier requirement
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSupplierRequirement(Guid id, [FromBody] UpdateSupplierRequirementRequest updateSupplierRequirement)
    {
        var command = new UpdateSupplierRequirementCommand
        {
            Id = id,
            UpdateSupplierRequirement = updateSupplierRequirement
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a supplier requirement
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSupplierRequirement(Guid id)
    {
        var command = new DeleteSupplierRequirementCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
