using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.CreateProcurementPolicyConfig;
using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.DeleteProcurementPolicyConfig;
using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.UpdateProcurementPolicyConfig;
using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Queries.GetProcurementPolicyConfigById;
using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Queries.GetProcurementPolicyConfigs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("procurement-policy-configs")]
[ApiController]
public class ProcurementPolicyConfigController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProcurementPolicyConfig([FromBody] CreateProcurementPolicyConfigCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetProcurementPolicyConfigById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<ProcurementPolicyConfigResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProcurementPolicyConfigs([FromQuery] GetProcurementPolicyConfigsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProcurementPolicyConfigResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProcurementPolicyConfigResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProcurementPolicyConfigById(Guid id)
    {
        var result = await mediator.Send(new GetProcurementPolicyConfigByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProcurementPolicyConfig(Guid id, [FromBody] UpdateProcurementPolicyConfigRequest request)
    {
        var command = new UpdateProcurementPolicyConfigCommand
        {
            Id = id,
            ProcurementModeThresholdId = request.ProcurementModeThresholdId,
            MinAmount = request.MinAmount,
            MaxAmount = request.MaxAmount
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProcurementPolicyConfig(Guid id)
    {
        var result = await mediator.Send(new DeleteProcurementPolicyConfigCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
