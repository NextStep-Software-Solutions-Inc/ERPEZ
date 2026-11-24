using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("function-types")]
[ApiController]
[Authorize]
public class FunctionTypeController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Planning.targetManage)]
    [ProducesResponseType(typeof(ApiResponse<List<string>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult GetFunctionTypes()
    {
        var functionTypes = Enum.GetNames<FunctionTypeEnum>().ToList();
        return Ok(ApiResponse<List<string>>.Success(functionTypes, "Function types retrieved successfully."));
    }
}
