using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.CreateUACSCodeSegment;

public class CreateUACSCodeSegmentCommand : IRequest<ApiResponse<Guid>>
{
    public UACSSegmentTypeEnum SegmentType { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsRequired { get; set; }
    public int MaxLength { get; set; }
    public string Pattern { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
