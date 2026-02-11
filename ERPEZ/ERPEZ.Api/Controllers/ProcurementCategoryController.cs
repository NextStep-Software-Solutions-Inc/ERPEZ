using ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.CreateProcurementCategory;
using ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.DeleteProcurementCategory;
using ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.UpdateProcurementCategory;
using ERPEZ.Application.Features.Planning.ProcurementCategory.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementCategory.Queries.GetProcurementCategories;
using ERPEZ.Application.Features.Planning.ProcurementCategory.Queries.GetProcurementCategoryById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("procurement-categories")]
[ApiController]
public class ProcurementCategoryController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get all procurement categories with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<ProcurementCategoryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProcurementCategories([FromQuery] SieveModel sieveModel)
    {
        var query = new GetProcurementCategoriesQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get procurement category by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProcurementCategoryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProcurementCategoryResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProcurementCategoryById(Guid id)
    {
        var query = new GetProcurementCategoryByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Create a new procurement category
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProcurementCategory([FromBody] CreateProcurementCategoryCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetProcurementCategoryById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Update an existing procurement category
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProcurementCategory(Guid id, [FromBody] UpdateProcurementCategoryCommand command)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a procurement category
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProcurementCategory(Guid id)
    {
        var command = new DeleteProcurementCategoryCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
