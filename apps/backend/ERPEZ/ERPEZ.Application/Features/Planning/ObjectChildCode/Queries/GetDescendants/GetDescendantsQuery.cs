using ERPEZ.Application.Features.Planning.ObjectChildCode.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Queries.GetDescendants;

public record GetDescendantsQuery(Guid ObjectId) : IRequest<ApiResponse<List<ObjectChildCodeResponse>>>;
