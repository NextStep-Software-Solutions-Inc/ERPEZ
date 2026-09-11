using System;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.ApprovePurchaseOrder;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.CreatePurchaseOrder;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.DeletePurchaseOrder;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.ReturnPurchaseOrder;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.SubmitPurchaseOrderForApproval;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.UpdatePurchaseOrder;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrderById;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrderItems;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrders;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;

namespace ERPEZ.Api.Controllers;

public record ReturnPurchaseOrderRequest(string ReturnReason);

/// <summary>
/// Manages Purchase Order operations
/// </summary>
[Route("purchase-orders")]
[ApiController]
[Authorize]
public class PurchaseOrdersController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get all Purchase Orders with pagination and filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PurchaseOrderListItemDto>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> GetPurchaseOrders([FromQuery] GetPurchaseOrdersQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get Purchase Order by Id
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PurchaseOrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PurchaseOrderDto>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> GetPurchaseOrderById(Guid id)
    {
        var result = await mediator.Send(new GetPurchaseOrderByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get Paginated Items for a Purchase Order
    /// </summary>
    [HttpGet("{id}/items")]
    [ProducesResponseType(typeof(PaginatedApiResponse<PurchaseOrderItemDto>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> GetPurchaseOrderItems(Guid id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? filters = null, [FromQuery] string? sorts = null)
    {
        var query = new GetPurchaseOrderItemsQuery(id, pageNumber, pageSize, filters, sorts);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Create a new Purchase Order
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> CreatePurchaseOrder([FromBody] CreatePurchaseOrderCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetPurchaseOrderById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Edit a Draft Purchase Order
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> UpdatePurchaseOrder(Guid id, [FromBody] UpdatePurchaseOrderCommand command)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a Draft Purchase Order
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> DeletePurchaseOrder(Guid id)
    {
        var result = await mediator.Send(new DeletePurchaseOrderCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Submit a Purchase Order for approval
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> SubmitPurchaseOrder(Guid id)
    {
        var result = await mediator.Send(new SubmitPurchaseOrderForApprovalCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Approve a Purchase Order
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> ApprovePurchaseOrder(Guid id)
    {
        var result = await mediator.Send(new ApprovePurchaseOrderCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Return a Purchase Order for revision
    /// </summary>
    [HttpPost("{id}/return")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> ReturnPurchaseOrder(Guid id, [FromBody] ReturnPurchaseOrderRequest request)
    {
        var result = await mediator.Send(new ReturnPurchaseOrderCommand(id, request.ReturnReason));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
