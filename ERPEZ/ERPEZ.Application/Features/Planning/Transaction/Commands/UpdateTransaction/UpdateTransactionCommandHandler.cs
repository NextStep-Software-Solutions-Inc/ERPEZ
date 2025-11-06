using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.UpdateTransaction;

public class UpdateTransactionCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateTransactionCommand, ApiResponse<Domain.Entities.Planning.Transaction>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Transaction>> Handle(UpdateTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _unitOfWork.TransactionRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Transaction not found.");
        var dto = request.UpdateTransaction;
        if (transaction.FundSourceId == dto.FundSourceId &&
            transaction.LocationId == dto.LocationId &&
            transaction.OrganizationId == dto.OrganizationId &&
            transaction.ObjectId == dto.ObjectId &&
            transaction.MFOPAPId == dto.MFOPAPId) throw new ConflictException("Transaction already exist.");

        transaction.FundSourceId = dto?.FundSourceId ?? transaction.FundSourceId;
        transaction.OrganizationId = dto?.OrganizationId ?? transaction.OrganizationId;
        transaction.MFOPAPId = dto?.MFOPAPId ?? transaction.MFOPAPId;
        transaction.LocationId = dto?.LocationId ?? transaction.LocationId;
        transaction.ObjectId = dto?.ObjectId ?? transaction.ObjectId;
        transaction.TransactionDate = dto?.TransactionDate ?? transaction.TransactionDate;
        transaction.AllotedAmount = dto?.AllotedAmount ?? transaction.AllotedAmount;
        transaction.ObligatedAmount = dto?.ObligatedAmount ?? transaction.ObligatedAmount;
        transaction.DisbursementAmount = dto?.DisbursementAmount ?? transaction.DisbursementAmount;

        _unitOfWork.TransactionRepository.Update(transaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.Transaction>.Success(transaction, "Transaction updated successfully.");
    }
}
