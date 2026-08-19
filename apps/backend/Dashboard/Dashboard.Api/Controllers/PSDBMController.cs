using ERPEZ.Application.Features.Planning.Psdbm.Commands.TriggerSync;
using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetCategories;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetDepots;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItemDetail;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetSyncRuns;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("api/psdbm")]
    [ApiController]
    public class PsdbmController(ISender mediator) : ControllerBase
    {
        /// <summary>
        /// Get PSDBM catalogue items with depot stock, price, and pagination
        /// </summary>
        [HttpGet("items")]
        [ProducesResponseType(typeof(ApiResponse<GetPsdbmItemsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<GetPsdbmItemsResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetItemsQuery(
            [FromQuery] string mode = "regional",
            [FromQuery] string? search = null,
            [FromQuery] string? category = null,
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

        /// <summary>
        /// Get PSDBM catalogue items by mode (backward-compatible route)
        /// </summary>
        [HttpGet("items/{mode}")]
        [ProducesResponseType(typeof(ApiResponse<GetPsdbmItemsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<GetPsdbmItemsResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetItems(
            [FromRoute] string mode,
            [FromQuery] string? search = null,
            [FromQuery] string? category = null,
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

        /// <summary>
        /// Get product detail and stock across all depots by ID
        /// </summary>
        [HttpGet("items/id/{id:guid}")]
        [ProducesResponseType(typeof(ApiResponse<PsdbmProductDetailDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<PsdbmProductDetailDto>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetItemById([FromRoute] Guid id)
        {
            var query = new GetPsdbmItemDetailQuery { Id = id };
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Get product detail and stock across all depots by item code
        /// </summary>
        [HttpGet("items/code/{itemCode}")]
        [ProducesResponseType(typeof(ApiResponse<PsdbmProductDetailDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<PsdbmProductDetailDto>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetItemByCode([FromRoute] string itemCode)
        {
            var query = new GetPsdbmItemDetailQuery { ItemCode = itemCode };
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Get distinct categories with item counts
        /// </summary>
        [HttpGet("categories")]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmCategoryDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllCategories()
        {
            var query = new GetPsdbmCategoriesQuery { Mode = "regional" };
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Get categories for a specific mode
        /// </summary>
        [HttpGet("categories/{mode}")]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmCategoryDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmCategoryDto>>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetCategories([FromRoute] string mode)
        {
            var query = new GetPsdbmCategoriesQuery { Mode = mode };
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Get available regional and LGU depots
        /// </summary>
        [HttpGet("depots")]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmDepotDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmDepotDto>>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetDepots()
        {
            var result = await mediator.Send(new GetPsdbmDepotsQuery());
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Trigger synchronization of PSDBM catalog and stocks
        /// </summary>
        [HttpPost("sync")]
        [ProducesResponseType(typeof(ApiResponse<PsdbmSyncResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<PsdbmSyncResultDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> TriggerSync([FromBody] PsdbmSyncRequestDto? request = null)
        {
            var command = new TriggerPsdbmSyncCommand
            {
                Request = request ?? new PsdbmSyncRequestDto()
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Get historical synchronization runs
        /// </summary>
        [HttpGet("sync/runs")]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmSyncRunDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSyncRuns([FromQuery] int count = 20)
        {
            var query = new GetPsdbmSyncRunsQuery { Count = count };
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Get a specific synchronization run by ID
        /// </summary>
        [HttpGet("sync/runs/{id:guid}")]
        [ProducesResponseType(typeof(ApiResponse<PsdbmSyncRunDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<PsdbmSyncRunDto>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetSyncRunById([FromRoute] Guid id)
        {
            var query = new GetPsdbmSyncRunByIdQuery { Id = id };
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : NotFound(result);
        }
    }
}