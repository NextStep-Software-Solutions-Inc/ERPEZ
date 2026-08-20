using ERPEZ.Application.Features.Procurement.AOBs.Commands.ApproveAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.AwardAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.CreateAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.DeleteAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.FinalizeRFQ;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.LinkRFQs;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.ReturnAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitSupplierBid;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.UpdateAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBById;
using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBMatrix;
using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("aobs")]
[Route("api/procurement/aobs")]
[Route("procurement/abstract-of-bids-aob")]
[ApiController]
public class AOBController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<AOBResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAOBs([FromQuery] GetAOBsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<AOBDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAOBById(Guid id)
    {
        var result = await mediator.Send(new GetAOBByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAOB([FromBody] CreateAOBCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? CreatedAtAction(nameof(GetAOBById), new { id = result.Data }, result) : BadRequest(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAOB(Guid id, [FromBody] UpdateAOBCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<Unit>.Fail("AOB ID in path must match AOB ID in body."));
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAOB(Guid id)
    {
        var result = await mediator.Send(new DeleteAOBCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("rfqs/{id}/finalize")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> FinalizeRFQ(Guid id)
    {
        var result = await mediator.Send(new FinalizeRFQCommand(id));
        if (!result.Succeeded)
        {
            if (result.Message != null && result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(result);
            }
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{id}/link-rfqs")]
    [HttpPost("{id}/link-rfq")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LinkRFQs(Guid id, [FromBody] LinkRFQsCommand command)
    {
        if (id != command.AOBId)
        {
            return BadRequest(ApiResponse<Unit>.Fail("AOB ID in path must match AOB ID in body."));
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id}/matrix")]
    [HttpGet("{id}/bid-matrix")]
    [ProducesResponseType(typeof(ApiResponse<AOBMatrixResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAOBMatrix(Guid id)
    {
        var result = await mediator.Send(new GetAOBMatrixQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id}/award")]
    [HttpPost("{id}/select-winner")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AwardAOB(Guid id, [FromBody] List<AwardItemInputDto> awardedItems)
    {
        var result = await mediator.Send(new AwardAOBCommand { AOBId = id, AwardedItems = awardedItems });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitAOB(Guid id, [FromBody] SubmitAOBCommand? command = null)
    {
        var result = await mediator.Send(new SubmitAOBCommand(id, command?.SubmittedBy));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveAOB(Guid id, [FromBody] ApproveAOBCommand command)
    {
        var result = await mediator.Send(command with { AOBId = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/return")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReturnAOB(Guid id, [FromBody] ReturnAOBCommand command)
    {
        var result = await mediator.Send(command with { AOBId = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("bids/submit")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitBid([FromBody] SubmitSupplierBidCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
