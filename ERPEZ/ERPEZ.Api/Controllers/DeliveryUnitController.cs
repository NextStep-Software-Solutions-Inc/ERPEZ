using ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.CreateDU;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.DeleteDU;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUByIdQuery;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUsQuery;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("delivery-units")]
    [ApiController]
    public class DeliveryUnitController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<DeliveryUnit>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<DeliveryUnit>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDeliveryUnit([FromBody] CreateDeliveryUnitCommand command)
        {
            var deliveryUnit = await mediator.Send(command);

            if (!deliveryUnit.Succeeded)
                return BadRequest(deliveryUnit);

            return CreatedAtAction(nameof(GetDeliveryUnitById), new { id = deliveryUnit.Data!.Id }, deliveryUnit);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<DeliveryUnitDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDeliveryUnits([FromQuery] GetDeliveryUnitsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DeliveryUnitDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDeliveryUnitById(Guid id)
        {
            var deliveryUnit = await mediator.Send(new GetDeliveryUnitByIdQuery(id));
            return deliveryUnit.Succeeded ? Ok(deliveryUnit) : BadRequest(deliveryUnit);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteDeliveryUnit(Guid id)
        {
            var command = new DeleteDeliveryUnitCommand(id);
            var deliveryUnit = await mediator.Send(command);

            return deliveryUnit.Succeeded ? Ok(deliveryUnit) : BadRequest(deliveryUnit);
        }
    }
}
