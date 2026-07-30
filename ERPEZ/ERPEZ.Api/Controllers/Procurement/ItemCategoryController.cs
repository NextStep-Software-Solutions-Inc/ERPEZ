using ERPEZ.Application.Features.Procurement.ItemCategories.Commands.CreateItemCategory;
using ERPEZ.Application.Features.Procurement.ItemCategories.Commands.DeleteItemCategory;
using ERPEZ.Application.Features.Procurement.ItemCategories.Commands.UpdateItemCategory;
using ERPEZ.Application.Features.Procurement.ItemCategories.Queries.GetItemCategories;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers.Procurement;

[ApiController]
[Route("api/procurement/item-categories")]
public class ItemCategoryController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetItemCategories([FromQuery] SieveModel sieveModel)
    {
        var result = await mediator.Send(new GetItemCategoriesQuery { SieveModel = sieveModel });
        var pageNumber = sieveModel.Page ?? 1;
        var pageSize = sieveModel.PageSize ?? (result.TotalCount > 0 ? result.TotalCount : 10);
        return Ok(new PaginatedApiResponse<ItemCategory>(result.Entities.ToList(), pageNumber, pageSize, result.TotalCount));
    }

    [HttpPost]
    public async Task<IActionResult> CreateItemCategory([FromBody] CreateItemCategoryCommand command)
    {
        var result = await mediator.Send(command);
        return Ok(ApiResponse<ItemCategory>.Success(result, "Item Category created successfully."));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateItemCategory(Guid id, [FromBody] UpdateItemCategoryCommand command)
    {
        if (id != command.Id) return BadRequest(ApiResponse<object>.Fail("ID mismatch."));
        var result = await mediator.Send(command);
        return Ok(ApiResponse<ItemCategory>.Success(result, "Item Category updated successfully."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteItemCategory(Guid id)
    {
        await mediator.Send(new DeleteItemCategoryCommand { Id = id });
        return Ok(ApiResponse<Unit>.Success(Unit.Value, "Item Category deleted successfully."));
    }
}
