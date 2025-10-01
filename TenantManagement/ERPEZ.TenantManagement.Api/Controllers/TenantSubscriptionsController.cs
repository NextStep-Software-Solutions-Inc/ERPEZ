using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.CreateTenantSubscription;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.DeleteTenantSubscription;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.UpdateTenantSubscription;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Queries.GetTenantSubscriptionById;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Queries.GetTenantSubscriptions;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("tenant-subscriptions")]
    [ApiController]
    public class TenantSubscriptionsController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<TenantSubscription>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateTenantSubscription([FromBody] CreateTenantSubscriptionCommand command)
        {
            var tenantSubscription = await mediator.Send(command);

            if (!tenantSubscription.Succeeded)
                return BadRequest(tenantSubscription);

            return CreatedAtAction(nameof(GetTenantSubscriptionById), new { id = tenantSubscription.Data!.Id }, tenantSubscription);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<TenantSubscription>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTenantSubscriptions([FromQuery] GetTenantSubscriptionsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<TenantSubscription>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTenantSubscriptionById(Guid id)
        {
            var query = new GetTenantSubscriptionByIdQuery(id);
            var tenantSubscription = await mediator.Send(query);

            if (tenantSubscription == null)
                return NotFound(ApiResponse<TenantSubscription>.Fail("Tenant subscription not found."));

            return Ok(ApiResponse<TenantSubscription>.Success(tenantSubscription, "Tenant subscription retrieved successfully."));
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTenantSubscription(Guid id, [FromBody] UpdateTenantSubscriptionDto tenantSubscriptionDto)
        {
            var request = new UpdateTenantSubscriptionCommand
            {
                Id = id,
                UpdateTenantSubscription = tenantSubscriptionDto
            };

            if (id != request.Id)
                return BadRequest(ApiResponse<TenantSubscription>.Fail("ID mismatch."));

            var tenantSubscription = await mediator.Send(request);
            return tenantSubscription.Succeeded ? Ok(tenantSubscription) : BadRequest(tenantSubscription);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTenantSubscription(Guid id)
        {
            var command = new DeleteTenantSubscriptionCommand(id);
            var tenantSubscription = await mediator.Send(command);

            return tenantSubscription.Succeeded ? Ok(tenantSubscription) : BadRequest(tenantSubscription);
        }
    }
}
