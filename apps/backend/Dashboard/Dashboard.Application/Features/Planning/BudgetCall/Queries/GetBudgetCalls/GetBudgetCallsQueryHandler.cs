using ERPEZ.Application.Features.Planning.BudgetCall.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Queries.GetBudgetCalls;

public class GetBudgetCallsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetBudgetCallsQuery, PaginatedApiResponse<BudgetCallResponse>>
{
    public async Task<PaginatedApiResponse<BudgetCallResponse>> Handle(GetBudgetCallsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts ?? "-SubmissionDeadline"
        };

        Expression<Func<Domain.Entities.Planning.BudgetCall, BudgetCallResponse>> projection = budgetCall => new BudgetCallResponse
        {
            Id = budgetCall.Id,
            FiscalYearId = budgetCall.FiscalYearId,
            Type = budgetCall.Type,
            SubmissionDeadline = budgetCall.SubmissionDeadline,
            Status = budgetCall.Status,
            CreatedAt = budgetCall.CreatedAt
        };

        var (budgetCalls, totalCount) = await unitOfWork.BudgetCallRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<BudgetCallResponse>(
            [.. budgetCalls],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
