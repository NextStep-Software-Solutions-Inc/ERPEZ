using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.CreateLIBAmendmentRequest;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.DeleteLIBAmendmentRequest;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.SubmitLIBAmendmentRequest;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.UpdateLIBAmendmentRequest;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Queries.GetLIBAmendmentRequestById;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Queries.GetLIBAmendmentRequests;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("lib-amendment-requests")]
[ApiController]
public class LIBAmendmentRequestController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CreateLIBAmendmentRequestResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<CreateLIBAmendmentRequestResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateLIBAmendmentRequest([FromBody] CreateLIBAmendmentRequestRequest request)
    {
        var result = await mediator.Send(new CreateLIBAmendmentRequestCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetLIBAmendmentRequestById), new { id = result.Data!.AmendmentRequestId }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<LIBAmendmentRequestResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLIBAmendmentRequests([FromQuery] GetLIBAmendmentRequestsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LIBAmendmentRequestResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLIBAmendmentRequestById(Guid id)
    {
        var result = await mediator.Send(new GetLIBAmendmentRequestByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLIBAmendmentRequest(Guid id, [FromBody] UpdateLIBAmendmentRequestRequest request)
    {
        var result = await mediator.Send(new UpdateLIBAmendmentRequestCommand(id, request));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitLIBAmendmentRequest(Guid id)
    {
        var result = await mediator.Send(new SubmitLIBAmendmentRequestCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLIBAmendmentRequest(Guid id)
    {
        var result = await mediator.Send(new DeleteLIBAmendmentRequestCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
