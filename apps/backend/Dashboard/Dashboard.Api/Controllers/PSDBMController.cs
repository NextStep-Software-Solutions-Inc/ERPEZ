using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetCategories;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetDepots;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("api/psdbm")]
    [ApiController]
    public class PsdbmController(ISender mediator) : ControllerBase
    {
        [HttpGet("items/{mode}")]
        [ProducesResponseType(typeof(ApiResponse<GetPsdbmItemsResponse>), StatusCodes.Status200OK)]      // ✅ was List<string>
        [ProducesResponseType(typeof(ApiResponse<GetPsdbmItemsResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetItems(
            [FromRoute] string mode,
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] int max = 50,
            [FromQuery] string? depot = null)
        {
            var query = new GetPsdbmItemsQuery
            {
                Mode = mode,
                Search = search,
                Category = category,
                Max = max,
                Depot = depot
            };

            var result = await mediator.Send(query);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("categories/{mode}")]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmCategoryDto>>), StatusCodes.Status200OK)]     // ✅ was ApiResponse<string>
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmCategoryDto>>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetCategories([FromRoute] string mode)
        {
            var query = new GetPsdbmCategoriesQuery { Mode = mode };
            var result = await mediator.Send(query);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("depots")]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmDepotDto>>), StatusCodes.Status200OK)]        // ✅ was ApiResponse<string>
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmDepotDto>>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetDepots()
        {
            var result = await mediator.Send(new GetPsdbmDepotsQuery());

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}