using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Queries.GetProjectChecklist;

public record GetProjectChecklistQuery(Guid ProcurementProjectId)
    : IRequest<ApiResponse<ProjectChecklistResponse>>;