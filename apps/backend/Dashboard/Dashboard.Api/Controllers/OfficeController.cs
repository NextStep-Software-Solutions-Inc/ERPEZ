using ERPEZ.Application.Features.Planning.Office.Commands.CreateOffice;
using ERPEZ.Application.Features.Planning.Office.Commands.DeleteOffice;
using ERPEZ.Application.Features.Planning.Office.Commands.UpdateOffice;
using ERPEZ.Application.Features.Planning.Office.Commands.UpdateOfficeWorkflow;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.Office.Queries.GetOfficeByIdQuery;
using ERPEZ.Application.Features.Planning.Office.Queries.GetOfficeHierarchy;
using ERPEZ.Application.Features.Planning.Office.Queries.GetOfficesQuery;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("offices")]
    [ApiController]
    [Authorize]
    public class OfficeController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateOffice([FromBody] CreateOfficeCommand command)
        {
            var office = await mediator.Send(command);

            return office.Succeeded ? CreatedAtAction(nameof(GetOfficeById), new { id = office.Data }, office) : BadRequest(office);
        }

        [HttpGet]
        [HasPermission(Permissions.Admin.orgStructureView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<OfficeResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetOffices([FromQuery] GetOfficesQuery query)
        {
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Admin.orgStructureView)]
        [ProducesResponseType(typeof(ApiResponse<OfficeDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetOfficeById(Guid id)
        {
            var office = await mediator.Send(new GetOfficeByIdQuery(id));
            return office.Succeeded ? Ok(office) : BadRequest(office);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateOffice(Guid id, [FromBody] UpdateOfficeRequest updateOffice)
        {
            var request = new UpdateOfficeCommand
            {
                Id = id,
                UpdateOffice = updateOffice
            };

            var office = await mediator.Send(request);
            return office.Succeeded ? Ok(office) : BadRequest(office);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteOffice(Guid id)
        {
            var command = new DeleteOfficeCommand(id);
            var office = await mediator.Send(command);

            return office.Succeeded ? NoContent() : NotFound();
        }

        [HttpPut("{id}/workflow")]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateOfficeWorkflow(Guid id, [FromBody] UpdateOfficeWorkflowCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("hierarchy")]
        [HasPermission(Permissions.Admin.orgStructureView)]
        [ProducesResponseType(typeof(ApiResponse<List<OfficeHierarchyResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<List<OfficeHierarchyResponse>>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetOfficeHierarchy([FromQuery] GetOfficeHierarchyQuery query)
        {
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
