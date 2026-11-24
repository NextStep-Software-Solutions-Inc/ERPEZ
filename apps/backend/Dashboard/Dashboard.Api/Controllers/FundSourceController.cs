using ERPEZ.Application.Features.Planning.FundSource.Commands.CreateFundSource;
using ERPEZ.Application.Features.Planning.FundSource.Commands.DeleteFundSource;
using ERPEZ.Application.Features.Planning.FundSource.Commands.ImportFundSourcesFromExcel;
using ERPEZ.Application.Features.Planning.FundSource.Commands.UpdateFundSource;
using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;
using ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSourceById;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("fund-sources")]
    [ApiController]
    [Authorize]
    public class FundSourcesController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Finance.fundSourceManage)]
        [ProducesResponseType(typeof(ApiResponse<FundSourceResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<FundSourceResponse>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateFundSource([FromBody] CreateFundSourceCommand command)
        {
            var response = await mediator.Send(command);

            if (!response.Succeeded)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetFundSourceById), new { id = response.Data }, response);
        }

        [HttpGet]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<FundSourceResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetFundSources([FromQuery] GetFundSourcesQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(ApiResponse<FundSourceResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetFundSourceById(Guid id)
        {
            var response = await mediator.Send(new GetFundSourceByIdQuery(id));
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Finance.fundSourceManage)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateFundSource(Guid id, [FromBody] UpdateFundSourceRequest updateFundSource)
        {
            var request = new UpdateFundSourceCommand
            {
                Id = id,
                UpdateFundSource = updateFundSource
            };

            var response = await mediator.Send(request);
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Finance.fundSourceManage)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteFundSource(Guid id)
        {
            var command = new DeleteFundSourceCommand(id);
            var response = await mediator.Send(command);

            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpPost("organization/{organizationId}/bulk")]
        [HasPermission(Permissions.Finance.fundSourceManage)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> BulkAssignOrganizationFundSource(
            Guid organizationId, 
            [FromBody] List<Guid> fundSourceIds)
        {
            var command = new ERPEZ.Application.Features.Planning.FundSource.Commands.BulkAssignOrganizationFundSource.BulkAssignOrganizationFundSourceCommand(
                organizationId, 
                fundSourceIds);
            var response = await mediator.Send(command);
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpPost("import-excel")]
        [HasPermission(Permissions.Finance.fundSourceManage)]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ImportFundSourcesFromExcel(
            IFormFile file,
            CancellationToken cancellationToken)
        {
            var response = await mediator.Send(new ImportFundSourcesFromExcelCommand { File = file }, cancellationToken);
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }
    }
}
