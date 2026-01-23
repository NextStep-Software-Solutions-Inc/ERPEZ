using ERPEZ.Application.Features.Planning.ObjectChildCode.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Queries.GetAncestors;

public record GetAncestorsQuery(Guid ObjectId) : IRequest<ApiResponse<List<ObjectChildCodeResponse>>>;
