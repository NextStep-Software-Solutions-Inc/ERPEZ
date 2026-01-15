using ERPEZ.Application.Features.Finance.Queries.GetAccountById;
using ERPEZ.Application.Features.Finance.Queries.GetAccounts;
using ERPEZ.Domain.Dtos.Finance;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers.Finance;

[ApiController]
[Route("accounts")]
public class AccountController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Gets a specific account by ID with balance information.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<AccountResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AccountResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAccountById(Guid id)
    {
        var result = await mediator.Send(new GetAccountByIdQuery(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Gets a paginated list of accounts with filtering and sorting support.
    /// Supports filtering by OfficeId, FundSourceId, FiscalYearId, Balance, etc. via Sieve.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<AccountResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAccounts([FromQuery] GetAccountsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }
}
