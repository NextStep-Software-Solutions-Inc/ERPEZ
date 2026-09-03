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
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("direct-contracting")]
[ApiController]
[Authorize]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public class DirectContractingController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Procurement.bacManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDirectContracting([FromBody] CreateDirectContractingCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetDirectContractingById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Procurement.bacManage)]
    [ProducesResponseType(typeof(PaginatedApiResponse<DirectContractingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDirectContractings([FromQuery] GetDirectContractingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Procurement.bacManage)]
    [ProducesResponseType(typeof(ApiResponse<DirectContractingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDirectContractingById(Guid id)
    {
        var result = await mediator.Send(new GetDirectContractingByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Procurement.bacManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateDirectContracting(Guid id, [FromBody] UpdateDirectContractingRequest request)
    {
        var result = await mediator.Send(new UpdateDirectContractingCommand { Id = id, Request = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("{id}/status")]
    [HasPermission(Permissions.Procurement.bacManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeDirectContractingStatusRequest request)
    {
        var result = await mediator.Send(new ChangeDirectContractingStatusCommand { Id = id, Status = request.Status });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("{id}/approve")]
    [HasPermission(Permissions.Procurement.bacManage)]
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
    [HasPermission(Permissions.Procurement.bacManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteDirectContracting(Guid id)
    {
        var result = await mediator.Send(new DeleteDirectContractingCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id}/proposal")]
    [HasPermission(Permissions.Procurement.bacManage)]
    [ProducesResponseType(typeof(ApiResponse<DirectContractingProposalResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProposal(Guid id)
    {
        var result = await mediator.Send(new GetDirectContractingProposalQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id}/proposal")]
    [HasPermission(Permissions.Procurement.supplierManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitProposal(Guid id, [FromBody] SubmitDirectContractingProposalRequest request)
    {
        var result = await mediator.Send(new SubmitDirectContractingProposalCommand { DirectContractingId = id, Request = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/review")]
    [HasPermission(Permissions.Procurement.bacManage)]
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
