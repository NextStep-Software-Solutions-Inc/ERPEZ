using ERPEZ.Application.Features.Planning.SalaryGrade.Commands.CreateSalaryGrade;
using ERPEZ.Application.Features.Planning.SalaryGrade.Commands.DeleteSalaryGrade;
using ERPEZ.Application.Features.Planning.SalaryGrade.Commands.UpdateSalaryGrade;
using ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;
using ERPEZ.Application.Features.Planning.SalaryGrade.Queries.GetSalaryGradeById;
using ERPEZ.Application.Features.Planning.SalaryGrade.Queries.GetSalaryGrades;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("salary-grades")]
[ApiController]
public class SalaryGradeController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSalaryGrade([FromBody] CreateSalaryGradeCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetSalaryGradeById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<SalaryGradeResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSalaryGrades([FromQuery] GetSalaryGradesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<SalaryGradeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSalaryGradeById(Guid id)
    {
        var result = await mediator.Send(new GetSalaryGradeByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSalaryGrade(Guid id, [FromBody] UpdateSalaryGradeRequest updateSalaryGrade)
    {
        var request = new UpdateSalaryGradeCommand
        {
            Id = id,
            UpdateSalaryGrade = updateSalaryGrade
        };

        var result = await mediator.Send(request);
        return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSalaryGrade(Guid id)
    {
        var result = await mediator.Send(new DeleteSalaryGradeCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
