using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.CreateTransaction;

public class CreateTransactionCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateTransactionCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        var transactionExist = await unitOfWork.TransactionRepository.FindAsync(t =>
        t.FundSourceId == request.FundSourceId &&
        t.OrganizationId == request.OrganizationId &&
        t.LocationId == request.LocationId &&
        t.MFOPAPId == request.MFOPAPId, cancellationToken: cancellationToken);
        if (transactionExist != null) throw new ConflictException("Transaction already exists.");
        var transaction = new Domain.Entities.Planning.Transaction
        {
            FundSourceId = request.FundSourceId,
            OrganizationId = request.OrganizationId,
            LocationId = request.LocationId,
            MFOPAPId = request.MFOPAPId,
            ObjectId = request.ObjectId,
            TransactionDate = request.TransactionDate,
            AllotedAmount = request.AllotedAmount,
            ObligatedAmount = request.ObligatedAmount,
            DisbursementAmount = request.DisbursementAmount
        };
        await unitOfWork.TransactionRepository.AddAsync(transaction, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(transaction.Id, "Transaction created successfully.");
    }
}
