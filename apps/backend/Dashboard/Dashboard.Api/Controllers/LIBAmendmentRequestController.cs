using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.CreateLIBAmendmentRequest;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.DeleteLIBAmendmentRequest;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.SubmitLIBAmendmentRequest;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.UpdateLIBAmendmentRequest;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Queries.GetLIBAmendmentRequestById;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Queries.GetLIBAmendmentRequests;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("lib-amendment-requests")]
[ApiController]
[Authorize]
public class LIBAmendmentRequestController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.libAmend)]
    [ProducesResponseType(typeof(ApiResponse<CreateLIBAmendmentRequestResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<CreateLIBAmendmentRequestResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateLIBAmendmentRequest([FromBody] CreateLIBAmendmentRequestRequest request)
    {
        var result = await mediator.Send(new CreateLIBAmendmentRequestCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetLIBAmendmentRequestById), new { id = result.Data!.AmendmentRequestId }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<LIBAmendmentRequestResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLIBAmendmentRequests([FromQuery] GetLIBAmendmentRequestsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(ApiResponse<LIBAmendmentRequestResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLIBAmendmentRequestById(Guid id)
    {
        var result = await mediator.Send(new GetLIBAmendmentRequestByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Planning.libAmend)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateLIBAmendmentRequest(Guid id, [FromBody] UpdateLIBAmendmentRequestRequest request)
    {
        var result = await mediator.Send(new UpdateLIBAmendmentRequestCommand(id, request));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/submit")]
    [HasPermission(Permissions.Planning.libAmend)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SubmitLIBAmendmentRequest(Guid id)
    {
        var result = await mediator.Send(new SubmitLIBAmendmentRequestCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Planning.libAmend)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteLIBAmendmentRequest(Guid id)
    {
        var result = await mediator.Send(new DeleteLIBAmendmentRequestCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }

    [HttpPost("{id}/approve")]
    [HasPermission(Permissions.Planning.libApprove)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ApproveLIBAmendmentRequest(Guid id)
    {
        var result = await mediator.Send(new ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.ApproveLIBAmendmentRequest.ApproveLIBAmendmentRequestCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/return")]
    [HasPermission(Permissions.Planning.libApprove)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ReturnLIBAmendmentRequest(Guid id, [FromBody] ReturnLIBAmendmentRequestRequest request)
    {
        var result = await mediator.Send(new ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.ReturnLIBAmendmentRequest.ReturnLIBAmendmentRequestCommand(id, request));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
