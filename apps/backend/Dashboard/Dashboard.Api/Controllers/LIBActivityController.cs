using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.CreateLIBActivity;
using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.DeleteLIBActivity;
using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.UpdateLIBActivity;
using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Queries.GetLIBActivities;
using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Queries.GetLIBActivityById;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLIBActivityObjects;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("lib-activities")]
[ApiController]
public class LIBActivityController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateLIBActivity([FromBody] CreateLIBActivityRequest request)
    {
        var result = await mediator.Send(new CreateLIBActivityCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetLIBActivityById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<LIBActivityResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLIBActivities([FromQuery] GetLIBActivitiesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LIBActivityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLIBActivityById(Guid id)
    {
        var result = await mediator.Send(new GetLIBActivityByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("{id}/expenditure-items")]
    [ProducesResponseType(typeof(ApiResponse<List<LIBActivityObjectResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLIBActivityExpenditureItems(Guid id)
    {
        var result = await mediator.Send(new GetLIBActivityObjectsQuery(id));
        return Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLIBActivity(Guid id, [FromBody] UpdateLIBActivityRequest request)
    {
        var result = await mediator.Send(new UpdateLIBActivityCommand(id, request));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLIBActivity(Guid id)
    {
        var result = await mediator.Send(new DeleteLIBActivityCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
