namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.UpdateChecklistItem;

public record UpdateChecklistItemRequest
{
    /// <summary>Toggle state from the BAC UI switch.</summary>
    public bool IsRequired { get; init; }

    /// <summary>Updated drag-and-drop position.</summary>
    public int OrderIndex { get; init; }
}