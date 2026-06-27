using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.DeleteChecklistItem;

public record DeleteChecklistItemCommand(Guid ProcurementProjectId, Guid ChecklistItemId)
    : IRequest<ApiResponse<Unit>>;