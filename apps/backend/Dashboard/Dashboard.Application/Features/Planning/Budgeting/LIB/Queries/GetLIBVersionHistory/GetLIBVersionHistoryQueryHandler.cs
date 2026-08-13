using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBVersionHistory;

public class GetLIBVersionHistoryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBVersionHistoryQuery, ApiResponse<List<LIBVersionHistoryResponse>>>
{
    public async Task<ApiResponse<List<LIBVersionHistoryResponse>>> Handle(GetLIBVersionHistoryQuery query, CancellationToken cancellationToken)
    {
        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {query.Id} not found.");

        // Extract the base LIB number (e.g., from "LIB-FMS-2026-v2" to "LIB-FMS-2026")
        var baseLIBNumber = lib.LIBNumber;
        var versionSuffixIndex = baseLIBNumber.IndexOf("-v");
        if (versionSuffixIndex > 0)
        {
            baseLIBNumber = baseLIBNumber.Substring(0, versionSuffixIndex);
        }

        // Query all LIBs that start with this base number (which captures v1, v2, v3, etc.)
        // and ensure they belong to the exact same tracking scope just to be safe.
        var queryable = unitOfWork.LineItemBudgetRepository.Query()
            .Where(x => x.LIBNumber.StartsWith(baseLIBNumber) 
                     && x.OfficeId == lib.OfficeId 
                     && x.FiscalYearId == lib.FiscalYearId)
            .OrderBy(x => x.Version)
            .Select(x => new LIBVersionHistoryResponse
            {
                Id = x.Id,
                LIBNumber = x.LIBNumber,
                Version = x.Version,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                TotalAmount = x.LineItemBudgetDetails != null ? x.LineItemBudgetDetails.Sum(d => d.Budget) : 0
            });

        var history = await unitOfWork.LineItemBudgetRepository.GetListAsync(queryable, cancellationToken);

        return ApiResponse<List<LIBVersionHistoryResponse>>.Success(history);
    }
}
