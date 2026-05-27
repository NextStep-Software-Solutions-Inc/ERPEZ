using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.CreateMarketScopingParameterSettings;
using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.DeleteMarketScopingParameterSettings;
using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.UpdateMarketScopingParameterSettings;
using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Dtos;
using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Queries.GetMarketScopingParameterSettings;
using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Queries.GetMarketScopingParameterSettingsById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("market-scoping-parameter-settings")]
[ApiController]
public class MarketScopingParameterSettingsController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateMarketScopingParameterSettings([FromBody] CreateMarketScopingParameterSettingsCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetMarketScopingParameterSettingsById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<MarketScopingParameterSettingsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMarketScopingParameterSettings([FromQuery] GetMarketScopingParameterSettingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<MarketScopingParameterSettingsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMarketScopingParameterSettingsById(Guid id)
    {
        var result = await mediator.Send(new GetMarketScopingParameterSettingsByIdQuery(id));
        return Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateMarketScopingParameterSettings(Guid id, [FromBody] UpdateMarketScopingParameterSettingsRequest dto)
    {
        var command = new UpdateMarketScopingParameterSettingsCommand { Id = id, UpdateData = dto };
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteMarketScopingParameterSettings(Guid id)
    {
        var result = await mediator.Send(new DeleteMarketScopingParameterSettingsCommand(id));
        return !result.Succeeded ? BadRequest(result) : Ok(result);
    }
}
