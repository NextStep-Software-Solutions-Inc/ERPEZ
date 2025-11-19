using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.DeleteTransaction;

public class DeleteTransactionCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteTransactionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await unitOfWork.TransactionRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Transaction not found.");

        unitOfWork.TransactionRepository.Remove(transaction);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Transaction with ID {request.Id} deleted successfully.");
    }
}
