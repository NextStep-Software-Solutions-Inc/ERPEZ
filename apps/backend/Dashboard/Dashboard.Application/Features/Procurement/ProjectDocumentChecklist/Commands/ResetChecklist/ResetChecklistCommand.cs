using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.ResetChecklist;

public record ResetChecklistCommand(Guid ProcurementProjectId)
    : IRequest<ApiResponse<Unit>>;