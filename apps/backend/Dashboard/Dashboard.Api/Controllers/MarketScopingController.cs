using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ApproveMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ChangeMarketScopingStatus;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingActivity;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingParameter;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.DeleteMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.LinkMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ReturnMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.SubmitMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.UnlinkMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.UpdateMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingActivities;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingById;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingParameters;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopings;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("market-scopings")]
[ApiController]
[Authorize]
public class MarketScopingController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateMarketScoping([FromBody] CreateMarketScopingRequest request)
    {
        var command = new CreateMarketScopingCommand(request);
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetMarketScopingById), new { id = result.Data }, result);
    }

    [HttpPost("{id}/activities")]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateMarketScopingActivity(Guid id, [FromBody] CreateMarketScopingActivityRequest request)
    {
        request.MarketScopingId = id;
        var command = new CreateMarketScopingActivityCommand(request);
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetMarketScopingActivities), new { id }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Planning.marketScopingView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<MarketScopingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMarketScopings([FromQuery] GetMarketScopingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/activities")]
    [HasPermission(Permissions.Planning.marketScopingView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<MarketScopingActivityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMarketScopingActivities(Guid id, int pageNumber = 1, int pageSize = 10, string? filters = null, string? sorts = null)
    {
        var query = new GetMarketScopingActivitiesQuery(id, pageNumber, pageSize, filters, sorts);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Planning.marketScopingView)]
    [ProducesResponseType(typeof(ApiResponse<MarketScopingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMarketScopingById(Guid id)
    {
        var result = await mediator.Send(new GetMarketScopingByIdQuery(id));
        return Ok(result);
    }

    [HttpGet("{id}/parameters")]
    [HasPermission(Permissions.Planning.marketScopingView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<MarketScopingParameterResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMarketScopingParameters(Guid id, int pageNumber = 1, int pageSize = 10, string? filters = null, string? sorts = null)
    {
        var query = new GetMarketScopingParametersQuery(id, pageNumber, pageSize, filters, sorts);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/parameters")]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateMarketScopingParameter(Guid id, [FromBody] CreateMarketScopingParameterRequest request)
    {
        request.MarketScopingId = id;
        var command = new CreateMarketScopingParameterCommand(request);
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetMarketScopingParameters), new { id }, result);
    }

    [HttpPut("{id}/status")]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ChangeMarketScopingStatus(Guid id, [FromBody] ChangeMarketScopingStatusRequest request)
    {
        request.MarketScopingId = id;
        var command = new ChangeMarketScopingStatusCommand(request);
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }

    [HttpPost("{id}/submit")]
    [HasPermission(Permissions.Planning.marketScopingSubmit)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SubmitMarketScoping(Guid id)
    {
        var command = new SubmitMarketScopingCommand(id);
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }

    [HttpPost("{id}/approve")]
    [HasPermission(Permissions.Planning.marketScopingApprove)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ApproveMarketScoping(Guid id, [FromBody] ApproveMarketScopingRequest? request)
    {
        var command = new ApproveMarketScopingCommand { Id = id, Request = request };
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }

    [HttpPost("{id}/return")]
    [HasPermission(Permissions.Planning.marketScopingApprove)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ReturnMarketScoping(Guid id, [FromBody] ReturnMarketScopingRequest? request)
    {
        var command = new ReturnMarketScopingCommand(id, request?.Remarks);
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateMarketScoping(Guid id, [FromBody] UpdateMarketScopingRequest request)
    {
        request.Id = id;
        var command = new UpdateMarketScopingCommand(request);
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }

    [HttpPatch("{id}/link")]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> LinkMarketScoping(Guid id, [FromBody] LinkMarketScopingRequest request)
    {
        var command = new LinkMarketScopingCommand(id, request);
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }

    [HttpPatch("{id}/unlink")]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UnlinkMarketScoping(Guid id)
    {
        var command = new UnlinkMarketScopingCommand(id);
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteMarketScoping(Guid id)
    {
        var result = await mediator.Send(new DeleteMarketScopingCommand(id));
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }
}
