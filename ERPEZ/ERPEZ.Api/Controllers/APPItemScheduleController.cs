using ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.CreateAPPItemSchedule;
using ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.DeleteAPPItemSchedule;
using ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.UpdateAPPItemSchedule;
using ERPEZ.Application.Features.Planning.APPItemSchedule.Dtos;
using ERPEZ.Application.Features.Planning.APPItemSchedule.Queries.GetAPPItemScheduleById;
using ERPEZ.Application.Features.Planning.APPItemSchedule.Queries.GetAPPItemSchedules;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("app-item-schedules")]
[ApiController]
public class APPItemScheduleController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateAPPItemSchedule([FromBody] CreateAPPItemScheduleRequest request)
    {
        var command = new CreateAPPItemScheduleCommand
        {
            APPId = request.APPId,
            APPItemId = request.APPItemId,
            ProcurementActivityTypeId = request.ProcurementActivityTypeId,
            ScheduledDate = request.ScheduledDate
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? CreatedAtAction(nameof(GetAPPItemScheduleById), new { id = result.Data }, result) : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<APPItemScheduleResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAPPItemSchedules([FromQuery] SieveModel sieveModel, [FromQuery] Guid? appItemId)
    {
        var result = await mediator.Send(new GetAPPItemSchedulesQuery(sieveModel, appItemId));
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<APPItemScheduleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAPPItemScheduleById(Guid id)
    {
        var result = await mediator.Send(new GetAPPItemScheduleByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAPPItemSchedule(Guid id, [FromBody] UpdateAPPItemScheduleRequest request)
    {
        var command = new UpdateAPPItemScheduleCommand
        {
            Id = id,
            APPId = request.APPId,
            APPItemId = request.APPItemId,
            ProcurementActivityTypeId = request.ProcurementActivityTypeId,
            ScheduledDate = request.ScheduledDate
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAPPItemSchedule(Guid id)
    {
        var result = await mediator.Send(new DeleteAPPItemScheduleCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
