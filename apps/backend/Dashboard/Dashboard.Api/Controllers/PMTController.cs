using ERPEZ.Application.Features.Planning.PMT.Commands.CreatePMT;
using ERPEZ.Application.Features.Planning.PMT.Commands.DeletePMT;
using ERPEZ.Application.Features.Planning.PMT.Commands.UpdatePMT;
using ERPEZ.Application.Features.Planning.PMT.Dtos;
using ERPEZ.Application.Features.Planning.PMT.Queries.GetPMTById;
using ERPEZ.Application.Features.Planning.PMT.Queries.GetPMTs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("pmts")]
[ApiController]
public class PMTController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePMT([FromBody] CreatePMTCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetPMTById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PMTResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPMTs([FromQuery] GetPMTsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PMTResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPMTById(Guid id)
    {
        var result = await mediator.Send(new GetPMTByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePMT(Guid id, [FromBody] UpdatePMTRequest updatePMT)
    {
        var request = new UpdatePMTCommand
        {
            Id = id,
            UpdatePMT = updatePMT
        };

        var result = await mediator.Send(request);
        return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePMT(Guid id)
    {
        var result = await mediator.Send(new DeletePMTCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
