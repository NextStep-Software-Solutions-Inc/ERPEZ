using ERPEZ.Application.Features.Planning.FunctionConfig.Commands.CreateFunctionConfig;
using ERPEZ.Application.Features.Planning.FunctionConfig.Commands.DeleteFunctionConfig;
using ERPEZ.Application.Features.Planning.FunctionConfig.Commands.UpdateFunctionConfig;
using ERPEZ.Application.Features.Planning.FunctionConfig.Dtos;
using ERPEZ.Application.Features.Planning.FunctionConfig.Queries.GetFunctionConfigById;
using ERPEZ.Application.Features.Planning.FunctionConfig.Queries.GetFunctionConfigs;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("function-configs")]
[ApiController]
[Authorize]
public class FunctionConfigController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.spmsFunctionWeightsManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateFunctionConfig([FromBody] CreateFunctionConfigCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetFunctionConfigById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Planning.targetManage)]
    [ProducesResponseType(typeof(PaginatedApiResponse<FunctionConfigResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetFunctionConfigs([FromQuery] GetFunctionConfigsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Planning.targetManage)]
    [ProducesResponseType(typeof(ApiResponse<FunctionConfigResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<FunctionConfigResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetFunctionConfigById(Guid id)
    {
        var result = await mediator.Send(new GetFunctionConfigByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Planning.spmsFunctionWeightsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateFunctionConfig(Guid id, [FromBody] UpdateFunctionConfigRequest request)
    {
        var command = new UpdateFunctionConfigCommand
        {
            Id = id,
            StrategicMinWeight = request.StrategicMinWeight,
            StrategicMaxWeight = request.StrategicMaxWeight,
            CoreFunctionMinWeight = request.CoreFunctionMinWeight,
            CoreFunctionMaxWeight = request.CoreFunctionMaxWeight,
            SupportMinWeight = request.SupportMinWeight,
            SupportMaxWeight = request.SupportMaxWeight
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Planning.spmsFunctionWeightsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteFunctionConfig(Guid id)
    {
        var result = await mediator.Send(new DeleteFunctionConfigCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
