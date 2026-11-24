using ERPEZ.Application.Common.Dtos.AMS;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers.AMS;

[Route("api/ams/license")]
[ApiController]
[Authorize]
public class AmsLicenseController(ILicenseConsumptionService licenseService) : ControllerBase
{
    [HttpGet("status")]
    [ProducesResponseType(typeof(ApiResponse<LicenseStatusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        var status = await licenseService.GetCurrentLicenseAsync(cancellationToken);
        return Ok(ApiResponse<LicenseStatusDto>.Success(status));
    }

    [HttpPost("activate")]
    [HasPermission(Permissions.Admin.systemAdminManage)]
    [ProducesResponseType(typeof(ApiResponse<LicenseActivationResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<LicenseActivationResultDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Activate([FromBody] ActivateLicenseRequestDto request, CancellationToken cancellationToken)
    {
        var domain = Request.Host.Host;
        var result = await licenseService.ActivateLicenseAsync(request.Key, domain, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(ApiResponse<LicenseActivationResultDto>.Fail(result.Message));
        }

        return Ok(ApiResponse<LicenseActivationResultDto>.Success(result));
    }
}
