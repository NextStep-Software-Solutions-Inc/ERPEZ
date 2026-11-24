using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.DeleteUACSCodeSegment;

public record DeleteUACSCodeSegmentCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
