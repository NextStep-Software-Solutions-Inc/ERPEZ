using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLIBActivityObjects;
public class GetLIBActivityObjectsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBActivityObjectsQuery, ApiResponse<List<LIBActivityObjectResponse>>>
{
    public async Task<ApiResponse<List<LIBActivityObjectResponse>>> Handle(
        GetLIBActivityObjectsQuery request, CancellationToken cancellationToken)
    {
        var results = await unitOfWork.LineItemBudgetDetailRepository.ToListAsync(
            unitOfWork.LineItemBudgetDetailRepository
                .Query(x => x.LineItemBudgetActivityId == request.LIBActivityId)
                .GroupBy(x => new { x.ObjectId, x.Object.Code, x.Object.Name })
                .Select(g => new LIBActivityObjectResponse
                {
                    ObjectId = g.Key.ObjectId,
                    ObjectCode = g.Key.Code,
                    ObjectName = g.Key.Name,
                    TotalBudget = g.Sum(x => x.Budget)
                }),
            cancellationToken);

        return ApiResponse<List<LIBActivityObjectResponse>>.Success(results);
    }
}