using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.CreateLineItemBudgetDetail;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.DeleteLineItemBudgetDetail;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.UpdateLineItemBudgetDetail;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLineItemBudgetDetailById;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLineItemBudgetDetails;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLIBActivityObjects;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("line-item-budget-details")]
[ApiController]
[Authorize]
public class LineItemBudgetDetailController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.libUpdate)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateLineItemBudgetDetail([FromBody] CreateLineItemBudgetDetailRequest request)
    {
        var result = await mediator.Send(new CreateLineItemBudgetDetailCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetLineItemBudgetDetailById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<LineItemBudgetDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLineItemBudgetDetails([FromQuery] GetLineItemBudgetDetailsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(ApiResponse<LineItemBudgetDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLineItemBudgetDetailById(Guid id)
    {
        var result = await mediator.Send(new GetLineItemBudgetDetailByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("activity-objects")]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(ApiResponse<List<LIBActivityObjectResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLIBActivityObjects([FromQuery] GetLIBActivityObjectsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Planning.libUpdate)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateLineItemBudgetDetail(Guid id, [FromBody] UpdateLineItemBudgetDetailRequest request)
    {
        var result = await mediator.Send(new UpdateLineItemBudgetDetailCommand(id, request));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Planning.libUpdate)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteLineItemBudgetDetail(Guid id)
    {
        var result = await mediator.Send(new DeleteLineItemBudgetDetailCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
