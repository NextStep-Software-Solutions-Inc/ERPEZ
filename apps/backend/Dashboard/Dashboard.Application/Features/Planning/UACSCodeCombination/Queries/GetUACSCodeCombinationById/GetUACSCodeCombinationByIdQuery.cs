using ERPEZ.Application.Features.Planning.UACSCodeCombination.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Queries.GetUACSCodeCombinationById;

public record GetUACSCodeCombinationByIdQuery(Guid Id) : IRequest<ApiResponse<UACSCodeCombinationResponse>>;
