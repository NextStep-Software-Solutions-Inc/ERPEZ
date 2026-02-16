using ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.CreateEconomicIndicator;
using ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.DeleteEconomicIndicator;
using ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.UpdateEconomicIndicator;
using ERPEZ.Application.Features.Planning.EconomicIndicator.Dtos;
using ERPEZ.Application.Features.Planning.EconomicIndicator.Queries.GetEconomicIndicatorById;
using ERPEZ.Application.Features.Planning.EconomicIndicator.Queries.GetEconomicIndicators;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("economic-indicators")]
[ApiController]
public class EconomicIndicatorController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<EconomicIndicatorResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEconomicIndicators([FromQuery] GetEconomicIndicatorsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<EconomicIndicatorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<EconomicIndicatorResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEconomicIndicatorById(Guid id)
    {
        var result = await mediator.Send(new GetEconomicIndicatorByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateEconomicIndicator([FromBody] CreateEconomicIndicatorCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetEconomicIndicatorById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEconomicIndicator(Guid id, [FromBody] UpdateEconomicIndicatorRequest request)
    {
        var command = new UpdateEconomicIndicatorCommand
        {
            Id = id,
            VATRate = request.VATRate,
            InflationRate = request.InflationRate,
            IncomeTaxRate = request.IncomeTaxRate
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEconomicIndicator(Guid id)
    {
        var result = await mediator.Send(new DeleteEconomicIndicatorCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
