using ERPEZ.Application.Common.Constants;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFunctionTypesQuery;

public class GetFunctionTypesQueryHandler : IRequestHandler<GetFunctionTypesQuery, ApiResponse<List<string>>>
{
    public Task<ApiResponse<List<string>>> Handle(GetFunctionTypesQuery request, CancellationToken cancellationToken)
    {
        var functionTypes = FunctionTypeConstants.ValidFunctionTypes;

        return Task.FromResult(
            ApiResponse<List<string>>.Success(
                functionTypes,
                $"{functionTypes.Count} unique function types retrieved successfully."
            )
        );
    }
}