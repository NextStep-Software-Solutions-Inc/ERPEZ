using ERPEZ.Application.Features.Finance.Commands.AuthorizeAccountTransaction;
using ERPEZ.Application.Features.Finance.Commands.CreateAccountTransaction;
using ERPEZ.Application.Features.Finance.Queries.GetAccountTransactionById;
using ERPEZ.Application.Features.Finance.Queries.GetAccountTransactions;
using ERPEZ.Domain.Dtos.Finance;
using ERPEZ.Domain.Dtos.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers.Finance;

[ApiController]
[Route("account-transactions")]
public class AccountTransactionController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Creates a new account transaction in Draft status.
    /// No funds are transferred until the transaction is authorized.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAccountTransaction([FromBody] CreateAccountTransactionCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded 
            ? CreatedAtAction(nameof(GetAccountTransactionById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Authorizes a transaction with PIN validation and executes the atomic fund transfer.
    /// This is the trigger that actually moves funds between accounts.
    /// </summary>
    [HttpPost("{id}/authorize")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AuthorizeAccountTransaction(Guid id, [FromBody] AuthorizeAccountTransactionCommand command)
    {
        if (id != command.TransactionId)
        {
            return BadRequest(ApiResponse<Unit>.Fail("Transaction ID mismatch."));
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Gets a specific account transaction by ID with full details.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<AccountTransactionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AccountTransactionResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAccountTransactionById(Guid id)
    {
        var result = await mediator.Send(new GetAccountTransactionByIdQuery(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Gets a paginated list of account transactions with filtering and sorting support.
    /// Supports filtering by AccountId, Status, TransactionDate, etc. via Sieve.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<AccountTransactionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAccountTransactions([FromQuery] GetAccountTransactionsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }
}
