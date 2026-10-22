using ERPEZ.Application.Features.Planning.Organization.Commands.CreateOrganization;
using ERPEZ.Application.Features.Planning.Organization.Commands.DeleteOrganization;
using ERPEZ.Application.Features.Planning.Organization.Commands.UpdateOrganization;
using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizationById;
using ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizations;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("organizations")]
    [ApiController]
    [Authorize]
    public class OrganizationController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationCommand command)
        {
            var organization = await mediator.Send(command);

            if (!organization.Succeeded)
                return BadRequest(organization);

            return CreatedAtAction(nameof(GetOrganizationById), new { id = organization.Data }, organization);
        }

        [HttpGet]
        [HasPermission(Permissions.Admin.orgStructureView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<OrganizationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetOrganizations([FromQuery] GetOrganizationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Admin.orgStructureView)]
        [ProducesResponseType(typeof(ApiResponse<OrganizationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetOrganizationById(Guid id)
        {
            var organization = await mediator.Send(new GetOrganizationByIdQuery(id));

            return organization.Succeeded ? Ok(organization) : BadRequest(organization);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateOrganization(Guid id, [FromBody] UpdateOrganizationRequest updateOrganization)
        {
            var request = new UpdateOrganizationCommand
            {
                Id = id,
                UpdateOrganization = updateOrganization
            };
            var organization = await mediator.Send(request);
            return organization.Succeeded ? Ok(organization) : BadRequest(organization);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteOrganization(Guid id)
        {
            var command = new DeleteOrganizationCommand(id);
            var organization = await mediator.Send(command);

            return organization.Succeeded ? Ok(organization) : BadRequest(organization);
        }
    }
}
