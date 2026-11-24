using ERPEZ.Application.Features.Planning.UACSCodeSegment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.UpdateUACSCodeSegment;

public class UpdateUACSCodeSegmentCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateUACSCodeSegmentRequest UpdateUACSCodeSegment { get; set; }
}
