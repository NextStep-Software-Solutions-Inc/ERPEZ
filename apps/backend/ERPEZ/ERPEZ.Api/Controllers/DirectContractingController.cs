using ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ChangeDirectContractingStatus;
using ERPEZ.Application.Features.Procurement.DirectContractings.Commands.CreateDirectContracting;
using ERPEZ.Application.Features.Procurement.DirectContractings.Commands.DeleteDirectContracting;
using ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ReviewDirectContractingProposal;
using ERPEZ.Application.Features.Procurement.DirectContractings.Commands.SubmitDirectContractingProposal;
using ERPEZ.Application.Features.Procurement.DirectContractings.Commands.UpdateDirectContracting;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingById;
using ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingProposal;
using ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractings;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("direct-contracting")]
[ApiController]
public class DirectContractingController(ISender mediator) : ControllerBase
{
    [HttpPost]
    //[Authorize(Roles = "BAC_Officer")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDirectContracting([FromBody] CreateDirectContractingCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetDirectContractingById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<DirectContractingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDirectContractings([FromQuery] GetDirectContractingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DirectContractingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDirectContractingById(Guid id)
    {
        var result = await mediator.Send(new GetDirectContractingByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    //[Authorize(Roles = "BAC_Officer")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateDirectContracting(Guid id, [FromBody] UpdateDirectContractingRequest request)
    {
        var result = await mediator.Send(new UpdateDirectContractingCommand { Id = id, Request = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("{id}/status")]
    //[Authorize(Roles = "BAC_Officer")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeDirectContractingStatusRequest request)
    {
        var result = await mediator.Send(new ChangeDirectContractingStatusCommand { Id = id, Status = request.Status });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("{id}/approve")]
    //[Authorize(Roles = "BAC_Officer")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveDirectContracting(Guid id, [FromBody] ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ApproveDirectContracting.ApproveDirectContractingRequest request)
    {
        var result = await mediator.Send(new ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ApproveDirectContracting.ApproveDirectContractingCommand 
        { 
            Id = id, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    //[Authorize(Roles = "BAC_Officer")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteDirectContracting(Guid id)
    {
        var result = await mediator.Send(new DeleteDirectContractingCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id}/proposal")]
    [ProducesResponseType(typeof(ApiResponse<DirectContractingProposalResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProposal(Guid id)
    {
        var result = await mediator.Send(new GetDirectContractingProposalQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id}/proposal")]
    //[Authorize(Roles = "Supplier")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitProposal(Guid id, [FromBody] SubmitDirectContractingProposalRequest request)
    {
        var result = await mediator.Send(new SubmitDirectContractingProposalCommand { DirectContractingId = id, Request = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/review")]
    //[Authorize(Roles = "BAC_Officer")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReviewProposal(Guid id, [FromBody] ReviewDirectContractingProposalRequest request)
    {
        var result = await mediator.Send(new ReviewDirectContractingProposalCommand
        {
            DirectContractingId = id,
            Action = request.Action,
            Remarks = request.Remarks
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
