using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.CreateMarketScopingActivitySettings;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.DeleteMarketScopingActivitySettings;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.UpdateMarketScopingActivitySettings;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Dtos;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Queries.GetMarketScopingActivitySettings;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Queries.GetMarketScopingActivitySettingsById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("market-scoping-activity-settings")]
[ApiController]
public class MarketScopingActivitySettingsController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateMarketScopingActivitySettings([FromBody] CreateMarketScopingActivitySettingsCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetMarketScopingActivitySettingsById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<MarketScopingActivitySettingsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMarketScopingActivitySettings([FromQuery] GetMarketScopingActivitySettingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<MarketScopingActivitySettingsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMarketScopingActivitySettingsById(Guid id)
    {
        var result = await mediator.Send(new GetMarketScopingActivitySettingsByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMarketScopingActivitySettings(Guid id, [FromBody] UpdateMarketScopingActivitySettingsRequest dto)
    {
        var command = new UpdateMarketScopingActivitySettingsCommand { Id = id, UpdateData = dto };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMarketScopingActivitySettings(Guid id)
    {
        var result = await mediator.Send(new DeleteMarketScopingActivitySettingsCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
