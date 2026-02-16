using ERPEZ.Application.Features.Planning.FunctionConfig.Commands.CreateFunctionConfig;
using ERPEZ.Application.Features.Planning.FunctionConfig.Commands.DeleteFunctionConfig;
using ERPEZ.Application.Features.Planning.FunctionConfig.Commands.UpdateFunctionConfig;
using ERPEZ.Application.Features.Planning.FunctionConfig.Dtos;
using ERPEZ.Application.Features.Planning.FunctionConfig.Queries.GetFunctionConfigById;
using ERPEZ.Application.Features.Planning.FunctionConfig.Queries.GetFunctionConfigs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("function-configs")]
[ApiController]
public class FunctionConfigController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<FunctionConfigResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFunctionConfigs([FromQuery] GetFunctionConfigsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FunctionConfigResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<FunctionConfigResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFunctionConfigById(Guid id)
    {
        var result = await mediator.Send(new GetFunctionConfigByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateFunctionConfig([FromBody] CreateFunctionConfigCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetFunctionConfigById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFunctionConfig(Guid id, [FromBody] UpdateFunctionConfigCommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<Guid>.Fail("Id mismatch"));

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFunctionConfig(Guid id)
    {
        var result = await mediator.Send(new DeleteFunctionConfigCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
