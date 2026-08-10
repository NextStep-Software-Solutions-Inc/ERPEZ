using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("function-types")]
[ApiController]
public class FunctionTypeController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<string>>), StatusCodes.Status200OK)]
    public IActionResult GetFunctionTypes()
    {
        var functionTypes = Enum.GetNames<FunctionTypeEnum>().ToList();
        return Ok(ApiResponse<List<string>>.Success(functionTypes, "Function types retrieved successfully."));
    }
}
