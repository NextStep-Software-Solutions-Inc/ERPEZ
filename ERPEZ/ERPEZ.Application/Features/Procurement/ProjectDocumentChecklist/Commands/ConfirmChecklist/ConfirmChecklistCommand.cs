using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.ConfirmChecklist;

public record ConfirmChecklistCommand(Guid ProcurementProjectId)
    : IRequest<ApiResponse<Unit>>;