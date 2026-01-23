using ERPEZ.Application.Features.Planning.UACSCodeSegment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Queries.GetUACSCodeSegmentById;

public record GetUACSCodeSegmentByIdQuery(Guid Id) : IRequest<ApiResponse<UACSCodeSegmentResponse>>;
