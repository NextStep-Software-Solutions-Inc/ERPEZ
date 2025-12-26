using ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.AssignKPIsToDeliveryUnit;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.CreateDU;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.DeleteDU;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.UpdateKPIsForDeliveryUnit;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUByIdQuery;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUsQuery;
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
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDeliveryUnit([FromBody] CreateDeliveryUnitCommand command)
        {
            var deliveryUnit = await mediator.Send(command);

            if (!deliveryUnit.Succeeded)
                return BadRequest(deliveryUnit);

            return CreatedAtAction(nameof(GetDeliveryUnitById), new { id = deliveryUnit.Data }, deliveryUnit);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<DeliveryUnitsResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDeliveryUnits([FromQuery] GetDeliveryUnitsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DeliveryUnitDetailedResponse>), StatusCodes.Status200OK)]
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

            return deliveryUnit.Succeeded ? NoContent() : NotFound();
        }

        [HttpPost("{id}/assign-kpis")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AssignKPIsToDeliveryUnit(string id, [FromBody] AssignKPIsToDeliveryUnitCommand command)
        {
            if(id != command.DeliveryUnitId.ToString())
            {
                return BadRequest(ApiResponse<Unit>.Fail("Delivery Unit ID in URL does not match with the one in the request body."));
            }
            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{id}/assign-kpis")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateKPIsForDeliveryUnit(string id, [FromBody] UpdateKPIsForDeliveryUnitCommand command)
        {
            if (id != command.DeliveryUnitId.ToString())
            {
                return BadRequest(ApiResponse<Unit>.Fail("Delivery Unit ID in URL does not match with the one in the request body."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
