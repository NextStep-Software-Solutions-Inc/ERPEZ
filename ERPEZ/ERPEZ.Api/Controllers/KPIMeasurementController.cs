using ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.CreateKPIMeasurement;
using ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.UpdateKPIMeasurement;
using ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.DeleteKPIMeasurement;
using ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;
using ERPEZ.Application.Features.Planning.KPIMeasurement.Queries.GetKPIMeasurements;
using ERPEZ.Application.Features.Planning.KPIMeasurement.Queries.GetKPIMeasurementById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("kpi-measurements")]
[ApiController]
public class KPIMeasurementController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Creates a KPI Measurement (Dimension: Quantity, Quality, Timeliness)
    /// Validates uniqueness per KPI and Dimension
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateKPIMeasurement([FromBody] CreateKPIMeasurementCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(CreateKPIMeasurement), new { id = result.Data }, result);
    }

    /// <summary>
    /// Gets all KPI Measurements with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<KPIMeasurementResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKPIMeasurements([FromQuery] GetKPIMeasurementsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<KPIMeasurementResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<KPIMeasurementResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetKPIMeasurementById(Guid id)
    {
        var result = await mediator.Send(new GetKPIMeasurementByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateKPIMeasurement(Guid id, [FromBody] UpdateKPIMeasurementCommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<Unit>.Fail("ID mismatch."));

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteKPIMeasurement(Guid id)
    {
        var result = await mediator.Send(new DeleteKPIMeasurementCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
