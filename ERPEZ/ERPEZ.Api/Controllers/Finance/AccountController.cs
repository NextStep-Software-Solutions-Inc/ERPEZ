using ERPEZ.Application.Features.Finance.Commands.CreateAccount;
using ERPEZ.Application.Features.Finance.Commands.DeleteAccount;
using ERPEZ.Application.Features.Finance.Commands.UpdateAccount;
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
    /// Creates a new financial account for an office and fiscal year.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetAccountById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Updates the name of an existing account.
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] UpdateAccountCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<Unit>.Fail("Account ID mismatch."));
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

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

    /// <summary>
    /// Deletes an account when its balance is zero.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAccount(Guid id)
    {
        var result = await mediator.Send(new DeleteAccountCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
