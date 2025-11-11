using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFunctionTypesQuery;

public class GetFunctionTypesQuery : IRequest<ApiResponse<List<string>>>
{
}