using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.DeleteAPR;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.SubmitAPR;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.UpdateAPR;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRs;
using ERPEZ.Application.Features.Procurement.APRs.Commands.CreateAPR;
using ERPEZ.Application.Planning.APRs.Queries.GetAPRById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.API.Controllers.Procurement;

[ApiController]
[Route("api/planning/aprs")]
public class APRsController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// GET api/planning/aprs
    /// Paginated + filterable list (Image 1's table; filter by Status/FY via Sieve query params
    /// e.g. ?Filters=Status==Draft,FiscalYear.Year==2026&PageNumber=1&PageSize=25)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetAPRsQuery query, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// GET api/planning/aprs/{id}
    /// Full detail view including items and milestones.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetAPRByIdQuery { Id = id }, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// POST api/planning/aprs
    /// Create APR from an approved APP (wizard Steps 1-3, Images 4-12).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAPRCommand command, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    /// <summary>
    /// PUT api/planning/aprs/{id}
    /// Edit a Draft APR's header and line items.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAPRCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest("Route Id and payload Id do not match.");

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// DELETE api/planning/aprs/{id}
    /// Soft delete a Draft APR (cascades to APRItems and APRItemMilestones).
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteAPRCommand { Id = id }, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// POST api/planning/aprs/{id}/submit
    /// Draft -> For Approval, with flat-FY renumbering (Image 1/2).
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id, CancellationToken cancellationToken)
    {
        var aprNumber = await mediator.Send(new SubmitAPRCommand { Id = id }, cancellationToken);
        return Ok(new { APRNumber = aprNumber });
    }
}
