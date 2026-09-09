using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Licenses.Commands.ActivateLicense;
using ERPEZ.TenantManagement.Application.Features.Licenses.Commands.GenerateLicenseKey;
using ERPEZ.TenantManagement.Application.Features.Licenses.Commands.RevokeLicenseKey;
using ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;
using ERPEZ.TenantManagement.Application.Features.Licenses.Queries.GetLicenseKeys;
using ERPEZ.TenantManagement.Application.Features.Licenses.Queries.GetTenantLicense;
using ERPEZ.TenantManagement.Application.Features.Licenses.Queries.ValidateLicense;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers;

[ApiController]
[Route("licenses")]
public class LicensesController(ISender mediator) : ControllerBase
{
    [HttpPost("generate")]
    [ProducesResponseType(typeof(ApiResponse<LicenseKeyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GenerateLicense([FromBody] GenerateLicenseKeyCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<LicenseKeyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLicenses([FromQuery] GetLicenseKeysQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("tenant/{tenantId}")]
    [ProducesResponseType(typeof(ApiResponse<LicenseKeyDto?>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTenantLicense(Guid tenantId, [FromQuery] string? currentDomain)
    {
        var result = await mediator.Send(new GetTenantLicenseQuery(tenantId, currentDomain));
        return Ok(result);
    }

    [HttpPost("activate")]
    [ProducesResponseType(typeof(ApiResponse<LicenseKeyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ActivateLicense([FromBody] ActivateLicenseCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("validate")]
    [ProducesResponseType(typeof(ApiResponse<LicenseValidationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ValidateLicense([FromBody] ValidateLicenseQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/revoke")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RevokeLicense(Guid id, [FromQuery] string? reason)
    {
        var result = await mediator.Send(new RevokeLicenseKeyCommand(id, reason));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
