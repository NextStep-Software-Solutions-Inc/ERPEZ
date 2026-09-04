using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Commands.UpdateFYActiveKPIMeasurement;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Queries.GetFYActiveKPIMeasurements;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Queries.GetFYActiveKPIMeasurementById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("fy-active-kpi-measurements")]
[ApiController]
[Authorize]
public class FYActiveKPIMeasurementController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Gets all FY Active KPI Measurements with pagination and filtering
    /// Supports filtering by FYActiveKPIId, Dimension, IsMOVEditable, IsScaleEditable
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<FYActiveKPIMeasurementResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Planning.kpiView)]
    public async Task<IActionResult> GetFYActiveKPIMeasurements([FromQuery] GetFYActiveKPIMeasurementsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Gets a specific FY Active KPI Measurement by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<FYActiveKPIMeasurementResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<FYActiveKPIMeasurementResponse>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Planning.kpiView)]
    public async Task<IActionResult> GetFYActiveKPIMeasurementById(Guid id)
    {
        var result = await mediator.Send(new GetFYActiveKPIMeasurementByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Updates an FY Active KPI Measurement (MOVs, Rating Scale, Editable flags)
    /// Only updates provided fields (partial update)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Planning.kpiUpdate)]
    public async Task<IActionResult> UpdateFYActiveKPIMeasurement(Guid id, [FromBody] UpdateFYActiveKPIMeasurementRequest dto)
    {
        var command = new UpdateFYActiveKPIMeasurementCommand { Id = id, UpdateFYActiveKPIMeasurement = dto };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
