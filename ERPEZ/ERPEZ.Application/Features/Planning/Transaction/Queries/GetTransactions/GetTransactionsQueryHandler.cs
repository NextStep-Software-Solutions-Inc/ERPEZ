using ERPEZ.Application.Features.Planning.Transaction.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Transaction.Queries.GetTransactions;

public class GetTransactionsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTransactionsQuery, PaginatedApiResponse<TransactionDto>>
{
    public async Task<PaginatedApiResponse<TransactionDto>> Handle(GetTransactionsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        Expression<Func<Domain.Entities.Planning.Transaction, TransactionDto>> projection = t => new()
        {
            Id = t.Id,
            FundSourceId = t.FundSourceId,
            OrganizationId = t.OrganizationId,
            LocationId = t.LocationId,
            MFOPAPId = t.MFOPAPId,
            ObjectId = t.ObjectId,
            TransactionDate = t.TransactionDate,
            AllotedAmount = t.AllotedAmount,
            ObligatedAmount = t.ObligatedAmount,
            DisbursementAmount = t.DisbursementAmount
        };

        var (transactions, totalCount) = await unitOfWork.TransactionRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<TransactionDto>(
            [.. transactions],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

