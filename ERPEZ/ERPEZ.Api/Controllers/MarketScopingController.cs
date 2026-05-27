using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ChangeMarketScopingStatus;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingActivity;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingParameter;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.DeleteMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.UpdateMarketScoping;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingActivities;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingById;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingParameters;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopings;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("market-scopings")]
[ApiController]
public class MarketScopingController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateMarketScoping([FromBody] CreateMarketScopingRequest request)
    {
        var result = await mediator.Send(new CreateMarketScopingCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetMarketScopingById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpPost("{id}/activities")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateMarketScopingActivity(Guid id, [FromBody] CreateMarketScopingActivityRequest request)
    {
        if (id != request.MarketScopingId)
        {
            return BadRequest(new ApiResponse<Guid>
            {
                Succeeded = false,
                Message = "Market Scoping ID in route and request body do not match."
            });
        }

        var result = await mediator.Send(new CreateMarketScopingActivityCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetMarketScopingById), new { id = result.Data }, result)
            : (result.Message?.Contains("not found") ?? false ? NotFound(result) : BadRequest(result));
    }

    [HttpGet("{id}/activities")]
    [ProducesResponseType(typeof(PaginatedApiResponse<MarketScopingActivityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMarketScopingActivities(
        Guid id,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? filters = null,
        [FromQuery] string? sorts = null)
    {
        var result = await mediator.Send(new GetMarketScopingActivitiesQuery(id, pageNumber, pageSize, filters, sorts));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id}/parameters")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateMarketScopingParameter(Guid id, [FromBody] CreateMarketScopingParameterRequest request)
    {
        if (id != request.MarketScopingId)
        {
            return BadRequest(new ApiResponse<Guid>
            {
                Succeeded = false,
                Message = "Market Scoping ID in route and request body do not match."
            });
        }

        var result = await mediator.Send(new CreateMarketScopingParameterCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetMarketScopingById), new { id = id }, result)
            : (result.Message?.Contains("not found") ?? false ? NotFound(result) : BadRequest(result));
    }

    [HttpPost("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangeMarketScopingStatus(Guid id, [FromBody] ChangeMarketScopingStatusRequest request)
    {
        if (id != request.MarketScopingId)
        {
            return BadRequest(new ApiResponse<Unit>
            {
                Succeeded = false,
                Message = "Market Scoping ID in route and request body do not match."
            });
        }

        var result = await mediator.Send(new ChangeMarketScopingStatusCommand(request));
        return result.Succeeded
            ? Ok(result)
            : (result.Message?.Contains("not found") ?? false ? NotFound(result) : BadRequest(result));
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<MarketScopingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMarketScopings(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? filters = null,
        [FromQuery] string? sorts = null)
    {
        var result = await mediator.Send(new GetMarketScopingsQuery(pageNumber, pageSize, filters, sorts));
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<MarketScopingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMarketScopingById(Guid id)
    {
        var result = await mediator.Send(new GetMarketScopingByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("{id}/parameters")]
    [ProducesResponseType(typeof(PaginatedApiResponse<MarketScopingParameterResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMarketScopingParameters(
        Guid id,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? filters = null,
        [FromQuery] string? sorts = null)
    {
        var result = await mediator.Send(new GetMarketScopingParametersQuery(id, pageNumber, pageSize, filters, sorts));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMarketScoping(Guid id, [FromBody] UpdateMarketScopingRequest request)
    {
        if (id != request.Id)
        {
            return BadRequest(new ApiResponse<Unit>
            {
                Succeeded = false,
                Message = "ID in route and request body do not match."
            });
        }

        var result = await mediator.Send(new UpdateMarketScopingCommand(request));
        return result.Succeeded ? Ok(result) : (result.Message?.Contains("not found") ?? false ? NotFound(result) : BadRequest(result));
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMarketScoping(Guid id)
    {
        var result = await mediator.Send(new DeleteMarketScopingCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
