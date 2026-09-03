using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.CreateOPCRPAPDepartment;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartments;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartmentById;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.DeleteOPCRPAPDepartment;

namespace ERPEZ.Api.Controllers
{
    [Route("opcr-pap-departments")]
    [ApiController]
    [Authorize]
public class OPCRPAPDepartmentController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<OPCRPAPDepartmentResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<OPCRPAPDepartmentResponse>), StatusCodes.Status400BadRequest)]
        [HasPermission(Permissions.Planning.opcrUpdate)]
        public async Task<IActionResult> CreateOPCRPAPDepartment([FromBody] CreateOPCRPAPDepartmentCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetOPCRPAPDepartmentById), new { id = result.Data }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OPCRPAPDepartmentResponse>), StatusCodes.Status200OK)]
        [HasPermission(Permissions.Planning.opcrView)]
        public async Task<IActionResult> GetOPCRPAPDepartments([FromQuery] GetOPCRPAPDepartmentsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRPAPDepartmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.opcrView)]
        public async Task<IActionResult> GetOPCRPAPDepartmentById(Guid id)
        {
            var result = await mediator.Send(new GetOPCRPAPDepartmentByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.opcrUpdate)]
        public async Task<IActionResult> DeleteOPCRPAPDepartment(Guid id)
        {
            var command = new DeleteOPCRPAPDepartmentCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
