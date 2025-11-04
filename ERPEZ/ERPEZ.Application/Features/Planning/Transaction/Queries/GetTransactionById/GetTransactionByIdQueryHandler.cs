using ERPEZ.Application.Features.Planning.Transaction.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Queries.GetTransactionById;

public class GetTransactionByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTransactionByIdQuery, ApiResponse<TransactionDto>>
{
    public async Task<ApiResponse<TransactionDto>> Handle(
        GetTransactionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var transactionQuery = unitOfWork.TransactionRepository
            .Query(t => t.Id == request.Id)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                LocationId = t.LocationId,
                OrganizationId = t.OrganizationId,
                FundSourceId = t.FundSourceId,
                ObjectId = t.ObjectId,
                MFOPAPId = t.MFOPAPId,
                AllotedAmount = t.AllotedAmount,
                ObligatedAmount = t.ObligatedAmount,
                DisbursementAmount = t.DisbursementAmount,
                TransactionDate = t.TransactionDate,
            });
        var transaction = await unitOfWork.TransactionRepository.GetSingleAsync(transactionQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");
        return ApiResponse<TransactionDto>.Success(transaction, "Retrieved successfully");
    }
}
