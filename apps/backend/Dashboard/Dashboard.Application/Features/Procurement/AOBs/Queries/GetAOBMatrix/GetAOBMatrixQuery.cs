using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBMatrix;

public record GetAOBMatrixQuery(Guid AOBId) : IRequest<ApiResponse<AOBMatrixResponse>>;
