using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.CreateMarketScopingActivitySettings;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.DeleteMarketScopingActivitySettings;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.UpdateMarketScopingActivitySettings;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Dtos;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Queries.GetMarketScopingActivitySettings;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Queries.GetMarketScopingActivitySettingsById;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("market-scoping-activity-settings")]
[ApiController]
[Authorize]
public class MarketScopingActivitySettingsController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateMarketScopingActivitySettings([FromBody] CreateMarketScopingActivitySettingsCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetMarketScopingActivitySettingsById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Planning.marketScopingView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<MarketScopingActivitySettingsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMarketScopingActivitySettings([FromQuery] GetMarketScopingActivitySettingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Planning.marketScopingView)]
    [ProducesResponseType(typeof(ApiResponse<MarketScopingActivitySettingsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMarketScopingActivitySettingsById(Guid id)
    {
        var result = await mediator.Send(new GetMarketScopingActivitySettingsByIdQuery(id));
        return Ok(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateMarketScopingActivitySettings(Guid id, [FromBody] UpdateMarketScopingActivitySettingsRequest dto)
    {
        var command = new UpdateMarketScopingActivitySettingsCommand { Id = id, UpdateData = dto };
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Planning.marketScopingManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteMarketScopingActivitySettings(Guid id)
    {
        var result = await mediator.Send(new DeleteMarketScopingActivitySettingsCommand(id));
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }
}
