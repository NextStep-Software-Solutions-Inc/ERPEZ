using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicApplicationStatus;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[AllowAnonymous]
[Route("api/public/applications")]
[ApiController]
public class PublicApplicationsController(ISender mediator) : ControllerBase
{
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PublicApplicationStatusDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetApplicationStatus(Guid id)
    {
        var result = await mediator.Send(new GetPublicApplicationStatusQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}