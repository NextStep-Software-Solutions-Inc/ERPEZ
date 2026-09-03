using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Planning.APPItem.Commands.CreateAPPItem;
using ERPEZ.Application.Features.Planning.APPItem.Commands.DeleteAPPItem;
using ERPEZ.Application.Features.Planning.APPItem.Commands.UpdateAPPItem;
using ERPEZ.Application.Features.Planning.APPItem.Dtos;
using ERPEZ.Application.Features.Planning.APPItem.Queries.GetAPPItemById;
using ERPEZ.Application.Features.Planning.APPItem.Queries.GetAPPItems;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("app-items")]
[ApiController]
[Authorize]
public class APPItemController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.appManage)]
    public async Task<IActionResult> CreateAPPItem([FromBody] CreateAPPItemRequest request)
    {
        var command = new CreateAPPItemCommand
        {
            APPId = request.APPId,
            PPMPItemId = request.PPMPItemId,
            ProcurementModeId = request.ProcurementModeId,
            FundSourceId = request.FundSourceId,
            OfficeId = request.OfficeId,
            PAPCode = request.PAPCode,
            Remarks = request.Remarks,
            IsEarlyProcurementActivity = request.IsEarlyProcurementActivity,
            IsOutsourced = request.IsOutsourced,
            BidEvaluationCriteria = request.BidEvaluationCriteria,
            ProcurementStrategies = request.ProcurementStrategies
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? CreatedAtAction(nameof(GetAPPItemById), new { id = result.Data }, result) : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<APPItemResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.appManage)]
    public async Task<IActionResult> GetAPPItems([FromQuery] SieveModel sieveModel)
    {
        var result = await mediator.Send(new GetAPPItemsQuery(sieveModel));
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<APPItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.appManage)]
    public async Task<IActionResult> GetAPPItemById(Guid id)
    {
        var result = await mediator.Send(new GetAPPItemByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.appManage)]
    public async Task<IActionResult> UpdateAPPItem(Guid id, [FromBody] UpdateAPPItemRequest request)
    {
        var command = new UpdateAPPItemCommand
        {
            Id = id,
            APPId = request.APPId,
            PPMPItemId = request.PPMPItemId,
            ProcurementModeId = request.ProcurementModeId,
            FundSourceId = request.FundSourceId,
            OfficeId = request.OfficeId,
            PAPCode = request.PAPCode,
            Remarks = request.Remarks,
            IsEarlyProcurementActivity = request.IsEarlyProcurementActivity,
            IsOutsourced = request.IsOutsourced,
            BidEvaluationCriteria = request.BidEvaluationCriteria,
            ProcurementStrategies = request.ProcurementStrategies
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.appManage)]
    public async Task<IActionResult> DeleteAPPItem(Guid id)
    {
        var result = await mediator.Send(new DeleteAPPItemCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
