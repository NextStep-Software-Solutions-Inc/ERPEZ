using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.LoadProfile;

public record LoadProfileCommand : IRequest<ApiResponse<Unit>>
{
    public Guid ProcurementProjectId { get; init; }
    public Guid DocumentProfileId    { get; init; }
}