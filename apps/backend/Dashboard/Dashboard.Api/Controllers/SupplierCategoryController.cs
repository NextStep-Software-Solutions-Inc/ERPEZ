using ERPEZ.Application.Features.Planning.SupplierCategory.Commands.CreateSupplierCategory;
using ERPEZ.Application.Features.Planning.SupplierCategory.Commands.DeleteSupplierCategory;
using ERPEZ.Application.Features.Planning.SupplierCategory.Commands.UpdateSupplierCategory;
using ERPEZ.Application.Features.Planning.SupplierCategory.Dtos;
using ERPEZ.Application.Features.Planning.SupplierCategory.Queries.GetSupplierCategories;
using ERPEZ.Application.Features.Planning.SupplierCategory.Queries.GetSupplierCategoryById;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("supplier-categories")]
[ApiController]
[Authorize]
public class SupplierCategoryController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new supplier category
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateSupplierCategory([FromBody] CreateSupplierCategoryCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetSupplierCategoryById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Get all supplier categories with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Procurement.supplierView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<SupplierCategoryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSupplierCategories([FromQuery] SieveModel sieveModel)
    {
        var query = new GetSupplierCategoriesQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get supplier category by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Procurement.supplierView)]
    [ProducesResponseType(typeof(ApiResponse<SupplierCategoryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SupplierCategoryResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSupplierCategoryById(Guid id)
    {
        var query = new GetSupplierCategoryByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update an existing supplier category
    /// </summary>
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateSupplierCategory(Guid id, [FromBody] UpdateSupplierCategoryRequest updateSupplierCategory)
    {
        var command = new UpdateSupplierCategoryCommand
        {
            Id = id,
            UpdateSupplierCategory = updateSupplierCategory
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a supplier category
    /// </summary>
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteSupplierCategory(Guid id)
    {
        var command = new DeleteSupplierCategoryCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
