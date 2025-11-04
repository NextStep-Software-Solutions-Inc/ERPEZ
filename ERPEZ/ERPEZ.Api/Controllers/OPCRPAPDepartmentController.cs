using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.CreateOPCRPAPDepartment;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartments;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartmentById;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.UpdateOPCRPAPDepartment;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.DeleteOPCRPAPDepartment;

namespace ERPEZ.Api.Controllers
{
    [Route("opcr-pap-departments")]
    [ApiController]
    public class OPCRPAPDepartmentController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<OPCRPAPDepartment>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<OPCRPAPDepartment>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOPCRPAPDepartment([FromBody] CreateOPCRPAPDepartmentCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetOPCRPAPDepartmentById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OPCRPAPDepartmentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOPCRPAPDepartments([FromQuery] GetOPCRPAPDepartmentsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRPAPDepartmentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOPCRPAPDepartmentById(Guid id)
        {
            var result = await mediator.Send(new GetOPCRPAPDepartmentByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRPAPDepartmentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOPCRPAPDepartment(Guid id, [FromBody] UpdateOPCRPAPDepartmentDto dto)
        {
            var command = new UpdateOPCRPAPDepartmentCommand
            {
                Id = id,
                UpdateOPCRPAPDepartment = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOPCRPAPDepartment(Guid id)
        {
            var command = new DeleteOPCRPAPDepartmentCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}