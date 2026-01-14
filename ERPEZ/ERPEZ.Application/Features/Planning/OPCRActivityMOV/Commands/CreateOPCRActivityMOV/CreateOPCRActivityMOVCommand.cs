using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.CreateOPCRActivityMOV;

public class CreateOPCRActivityMOVCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid OPCRActivityId { get; set; }
    public required string FileName { get; set; }
    public string? Url { get; set; }
    public DateTime? UploadedDate { get; set; }
}
