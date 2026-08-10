using ERPEZ.Application.Features.Planning.PMTMember.Commands.CreatePMTMember;
using ERPEZ.Application.Features.Planning.PMTMember.Commands.DeletePMTMember;
using ERPEZ.Application.Features.Planning.PMTMember.Commands.UpdatePMTMember;
using ERPEZ.Application.Features.Planning.PMTMember.Dtos;
using ERPEZ.Application.Features.Planning.PMTMember.Queries.GetPMTMemberById;
using ERPEZ.Application.Features.Planning.PMTMember.Queries.GetPMTMembers;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("pmt-members")]
[ApiController]
public class PMTMemberController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePMTMember([FromBody] CreatePMTMemberCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetPMTMemberById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PMTMemberResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPMTMembers([FromQuery] GetPMTMembersQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PMTMemberResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPMTMemberById(Guid id)
    {
        var result = await mediator.Send(new GetPMTMemberByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePMTMember(Guid id, [FromBody] UpdatePMTMemberRequest updatePMTMember)
    {
        var request = new UpdatePMTMemberCommand
        {
            Id = id,
            UpdatePMTMember = updatePMTMember
        };

        var result = await mediator.Send(request);
        return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePMTMember(Guid id)
    {
        var result = await mediator.Send(new DeletePMTMemberCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
