using ERPEZ.Application.Features.Planning.ItemPrice.Commands.CreateItemPrice;
using ERPEZ.Application.Features.Planning.ItemPrice.Commands.DeleteItemPrice;
using ERPEZ.Application.Features.Planning.ItemPrice.Commands.UpdateItemPrice;
using ERPEZ.Application.Features.Planning.ItemPrice.Dtos;
using ERPEZ.Application.Features.Planning.ItemPrice.Queries.GetItemPriceById;
using ERPEZ.Application.Features.Planning.ItemPrice.Queries.GetItemPrices;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("item-price")]
[ApiController]
public class ItemPriceController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new item price entry for a specific Fiscal Year
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateItemPrice([FromBody] CreateItemPriceCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetItemPriceById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Get all item prices with filtering, sorting, and pagination (showing procurementItem.name and fiscalYear.year)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<ItemPriceResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetItemPrices([FromQuery] SieveModel sieveModel)
    {
        var query = new GetItemPricesQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get item price by ID with full details including nested item and fiscal year objects
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ItemPriceDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ItemPriceDetailedResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetItemPriceById(Guid id)
    {
        var query = new GetItemPriceByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update an existing item price or fiscal year association
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateItemPrice(Guid id, [FromBody] UpdateItemPriceRequest updateItemPrice)
    {
        var command = new UpdateItemPriceCommand
        {
            Id = id,
            UpdateItemPrice = updateItemPrice
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete an item price entry from the catalogue
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteItemPrice(Guid id)
    {
        var command = new DeleteItemPriceCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
