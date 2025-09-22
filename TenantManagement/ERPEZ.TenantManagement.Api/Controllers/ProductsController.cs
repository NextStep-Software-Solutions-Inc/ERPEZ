using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Products.Commands.CreateProduct;
using ERPEZ.TenantManagement.Application.Features.Products.Queries.GetProducts;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
    {
        var productId = await mediator.Send(command);
        var response = ApiResponse<Guid>.Success(productId, "Product created successfully.");

        // Use CreatedAtRoute to point to where the new resource can be found
        return CreatedAtAction(nameof(GetProducts), new { id = productId }, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<Product>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProducts([FromQuery] GetProductsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }
}