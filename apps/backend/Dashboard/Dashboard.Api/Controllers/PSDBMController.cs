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
        [HttpGet("items/{mode}")]
        [ProducesResponseType(typeof(ApiResponse<GetPsdbmItemsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<GetPsdbmItemsResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetItems(
            [FromRoute] string? mode = "regional",
            [FromQuery] string? search = null,
            [FromQuery] string? category = null,
            [FromQuery] string? depot = null,
            [FromQuery] string? availability = null,
            [FromQuery] string? stockFilter = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] bool sortDescending = false,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 25,
            [FromQuery] int max = 50)
        {
            var query = new GetPsdbmItemsQuery
            {
                Mode = mode ?? "regional",
                Search = search,
                Category = category,
                Depot = depot,
                Availability = availability,
                StockFilter = stockFilter,
                SortBy = sortBy,
                SortDescending = sortDescending,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Max = max
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
        /// Get available regional and LGU depots (optionally filtered by mode: 'regional' or 'lgu')
        /// </summary>
        [HttpGet("depots")]
        [HttpGet("depots/{mode}")]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmDepotDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<List<PsdbmDepotDto>>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetDepots([FromRoute] string? mode = null, [FromQuery] string? queryMode = null)
        {
            var effectiveMode = !string.IsNullOrWhiteSpace(mode) ? mode : queryMode;
            var result = await mediator.Send(new GetPsdbmDepotsQuery { Mode = effectiveMode });
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