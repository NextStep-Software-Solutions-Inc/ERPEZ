using ERPEZ.Application.Features.Planning.Attribute.Commands.CreateAttribute;
using ERPEZ.Application.Features.Planning.Attribute.Commands.DeleteAttribute;
using ERPEZ.Application.Features.Planning.Attribute.Commands.UpdateAttribute;
using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.Attribute.Queries.GetAttributeById;
using ERPEZ.Application.Features.Planning.Attribute.Queries.GetAttributes;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("attributes")]
[ApiController]
[Authorize]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public class AttributeController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAttribute([FromBody] CreateAttributeCommand command)
    {
        var response = await mediator.Send(command);
        return response.Succeeded
            ? CreatedAtAction(nameof(GetAttributeById), new { id = response.Data }, response)
            : BadRequest(response);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAttribute(Guid id, [FromBody] UpdateAttributeCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<Unit>.Fail("The ID in the URL does not match the ID in the request body."));
        }

        var response = await mediator.Send(command);
        return response.Succeeded ? Ok(response) : NotFound(response);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAttribute(Guid id)
    {
        var response = await mediator.Send(new DeleteAttributeCommand { Id = id });
        return response.Succeeded ? Ok(response) : NotFound(response);
    }

    [HttpGet]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<AttributeResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAttributes([FromQuery] GetAttributesQuery query)
    {
        var response = await mediator.Send(query);
        return response.Succeeded ? Ok(response) : BadRequest(response);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(ApiResponse<AttributeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AttributeResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAttributeById(Guid id)
    {
        var response = await mediator.Send(new GetAttributeByIdQuery { Id = id });
        return response.Succeeded ? Ok(response) : NotFound(response);
    }
}
