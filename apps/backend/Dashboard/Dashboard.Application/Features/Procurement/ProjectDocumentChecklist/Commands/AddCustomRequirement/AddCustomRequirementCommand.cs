using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.AddCustomRequirement;

public record AddCustomRequirementCommand : IRequest<ApiResponse<Guid>>
{
    public Guid            ProcurementProjectId { get; init; }
    public required string CustomDocumentName   { get; init; }
    public int             EnvelopeType         { get; init; }
    public int             OrderIndex           { get; init; }
    public Guid?           FileId               { get; init; }
}