using ERPEZ.Application.Features.Planning.Transaction.Commands.CreateTransaction;
using ERPEZ.Application.Features.Planning.Transaction.Commands.DeleteTransaction;
using ERPEZ.Application.Features.Planning.Transaction.Commands.UpdateTransaction;
using ERPEZ.Application.Features.Planning.Transaction.Dtos;
using ERPEZ.Application.Features.Planning.Transaction.Queries.GetTransactionById;
using ERPEZ.Application.Features.Planning.Transaction.Queries.GetTransactions;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("transactions")]
    [ApiController]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public class TransactionController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionCommand command)
        {
            var transaction = await mediator.Send(command);

            if (!transaction.Succeeded)
                return BadRequest(transaction);

            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Data }, transaction);
        }

        [HttpGet]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<TransactionResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTransactions([FromQuery] GetTransactionsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(ApiResponse<TransactionDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTransactionById(Guid id)
        {
            var transaction = await mediator.Send(new GetTransactionByIdQuery(id));

            return transaction.Succeeded ? Ok(transaction) : BadRequest(transaction);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTransaction(Guid id, [FromBody] UpdateTransactionRequest updateTransaction)
        {
            var request = new UpdateTransactionCommand
            {
                Id = id,
                UpdateTransaction = updateTransaction
            };

            var transaction = await mediator.Send(request);
            return transaction.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(transaction);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTransaction(Guid id)
        {
            var command = new DeleteTransactionCommand(id);
            var transaction = await mediator.Send(command);

            return transaction.Succeeded ? NoContent() : NotFound();
        }
    }
}
