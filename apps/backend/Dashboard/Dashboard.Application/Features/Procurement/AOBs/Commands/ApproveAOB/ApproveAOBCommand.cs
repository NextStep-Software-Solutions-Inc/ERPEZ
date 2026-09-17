using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.ApproveAOB;

public record ApproveAOBCommand : IRequest<ApiResponse<Unit>>
{
    public Guid AOBId { get; init; }
    public Guid? ApprovedBy { get; init; }
    public string? ApprovedByName { get; init; }
    public string? SignedDocumentUrl { get; init; }
    public string? Remarks { get; init; }
}
