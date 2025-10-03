using ERPEZ.Application.Common;
using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Planning.Transaction.Commands.CreateTransaction;
using ERPEZ.TenantManagement.Application.Features.Planning.Transaction.Commands.DeleteTransaction;
using ERPEZ.TenantManagement.Application.Features.Planning.Transaction.Commands.UpdateTransaction;
using ERPEZ.TenantManagement.Application.Features.Planning.Transaction.Dtos;
using ERPEZ.TenantManagement.Application.Features.Planning.Transaction.Queries.GetTransactionById;
using ERPEZ.TenantManagement.Application.Features.Planning.Transaction.Queries.GetTransactions;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("transactions")]
    [ApiController]
    public class TransactionController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Transaction>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Transaction>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionCommand command)
        {
            var transaction = await mediator.Send(command);

            if (!transaction.Succeeded)
                return BadRequest(transaction);

            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Data!.Id }, transaction);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<TransactionDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTransactions([FromQuery] GetTransactionsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<TransactionDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTransactionById(Guid id)
        {
            var transaction = await mediator.Send(new GetTransactionByIdQuery(id));
            if (transaction == null)
                return NotFound(ApiResponse<TransactionDto>.Fail("Transaction not found."));

            return transaction.Succeeded ? Ok(transaction) : BadRequest(transaction);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTransaction(Guid id, [FromBody] UpdateTransactionDto updateTransaction)
        {
            var request = new UpdateTransactionCommand
            {
                Id = id,
                UpdateTransaction = updateTransaction
            };

            if (id != request.Id)
                return BadRequest(ApiResponse<Transaction>.Fail("ID mismatch."));

            var transaction = await mediator.Send(request);
            return transaction.Succeeded ? Ok(transaction) : BadRequest(transaction);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTransaction(Guid id)
        {
            var command = new DeleteTransactionCommand(id);
            var transaction = await mediator.Send(command);

            return transaction.Succeeded ? Ok(transaction) : BadRequest(transaction);
        }
    }
}
