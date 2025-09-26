using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.CreateTenantSetting;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.DeleteTenantSetting;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.UpdateTenantSetting;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Queries.GetTenantSettingById;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Queries.GetTenantSettings;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("tenant-settings")]
    [ApiController]
    public class TenantSettingsController(ISender mediator) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<TenantSetting>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTenantSettings([FromQuery] GetTenantSettingsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<TenantSetting>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTenantSettingById(Guid id)
        {
            var query = new GetTenantSettingByIdQuery(id);
            var tenantSetting = await mediator.Send(query);

            if (tenantSetting == null)
            {
                return NotFound(ApiResponse<TenantSetting>.Fail($"Tenant with ID {id} not found."));
            }

            return Ok(ApiResponse<TenantSetting>.Success(tenantSetting, "Tenant setting retrieved successfully."));
        }

        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateTenantSetting([FromBody] CreateTenantSettingCommand command)
        {
            var tenantSettingId = await mediator.Send(command);
            var response = ApiResponse<Guid>.Success(tenantSettingId, "Tenant setting created successfully.");

            return CreatedAtAction(nameof(GetTenantSettingById), new { id = tenantSettingId }, response);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTenantSetting(Guid id, [FromBody] UpdateTenantSettingCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest(ApiResponse<TenantSetting>.Fail("ID mismatch between route and body."));
            }

            var response = await mediator.Send(command);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTenantSetting(Guid id)
        {
            var command = new DeleteTenantSettingCommand(id);

            await mediator.Send(command);

            return NoContent();
        }
    }
}
