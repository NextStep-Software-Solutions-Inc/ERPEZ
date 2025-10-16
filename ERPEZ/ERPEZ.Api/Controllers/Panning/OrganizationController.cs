using ERPEZ.Application.Features.Planning.Organization.Commands.CreateOrganization;
using ERPEZ.Application.Features.Planning.Organization.Commands.DeleteOrganization;
using ERPEZ.Application.Features.Planning.Organization.Commands.UpdateOrganization;
using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizationById;
using ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizations;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers.Panning
{
    [Route("organizations")]
    [ApiController]
    [ApiExplorerSettings(GroupName = "catalog")]
    public class OrganizationController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Organization>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Organization>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationCommand command)
        {
            var organization = await mediator.Send(command);

            if (!organization.Succeeded)
                return BadRequest(organization);

            return CreatedAtAction(nameof(GetOrganizationById), new { id = organization.Data!.Id }, organization);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OrganizationDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOrganizations([FromQuery] GetOrganizationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OrganizationDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrganizationById(Guid id)
        {
            var organization = await mediator.Send(new GetOrganizationByIdQuery(id));

            return organization.Succeeded ? Ok(organization) : BadRequest(organization);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrganization(Guid id, [FromBody] UpdateOrganizationDto updateOrganization)
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
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOrganization(Guid id)
        {
            var command = new DeleteOrganizationCommand(id);
            var organization = await mediator.Send(command);

            return organization.Succeeded ? Ok(organization) : BadRequest(organization);
        }
    }
}
