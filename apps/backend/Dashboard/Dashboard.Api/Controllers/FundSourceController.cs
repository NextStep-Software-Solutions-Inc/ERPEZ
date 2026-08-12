using ERPEZ.Application.Features.Planning.FundSource.Commands.CreateFundSource;
using ERPEZ.Application.Features.Planning.FundSource.Commands.DeleteFundSource;
using ERPEZ.Application.Features.Planning.FundSource.Commands.UpdateFundSource;
using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;
using ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSourceById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("fund-sources")]
    [ApiController]
    public class FundSourcesController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<FundSourceResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<FundSourceResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateFundSource([FromBody] CreateFundSourceCommand command)
        {
            var response = await mediator.Send(command);

            if (!response.Succeeded)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetFundSourceById), new { id = response.Data }, response);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<FundSourceResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetFundSources([FromQuery] GetFundSourcesQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<FundSourceResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetFundSourceById(Guid id)
        {
            var response = await mediator.Send(new GetFundSourceByIdQuery(id));
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteFundSource(Guid id)
        {
            var command = new DeleteFundSourceCommand(id);
            var response = await mediator.Send(command);

            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpPost("organization/{organizationId}/bulk")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ImportFundSourcesFromExcel(
            IFormFile file,
            [FromServices] ERPEZ.Infrastructure.Persistence.ApplicationDbContext context,
            CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
                return BadRequest(ApiResponse<int>.Fail("No file was uploaded."));

            using var stream = file.OpenReadStream();
            var count = await ERPEZ.Infrastructure.Persistence.Seeders.FundSourceSeeder.SeedFromExcelAsync(context, stream, cancellationToken);
            return Ok(ApiResponse<int>.Success(count, $"Successfully imported {count} Fund Source records."));
        }
    }
}
