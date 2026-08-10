using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.UpdateChecklistItem;

public record UpdateChecklistItemCommand : IRequest<ApiResponse<Unit>>
{
    public Guid ProcurementProjectId { get; init; }
    public Guid ChecklistItemId      { get; init; }

    /// <summary>Toggle state from the BAC UI switch.</summary>
    public bool IsRequired { get; init; }

    /// <summary>Updated drag-and-drop position.</summary>
    public int OrderIndex { get; init; }
}