using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands;
using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Queries.GetProjectChecklist;

public class GetProjectChecklistQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProjectChecklistQuery, ApiResponse<ProjectChecklistResponse>>
{
    public async Task<ApiResponse<ProjectChecklistResponse>> Handle(
        GetProjectChecklistQuery request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
                          .GetByIdAsync(request.ProcurementProjectId, cancellationToken)
                      ?? throw new NotFoundException("Procurement project not found.");

        var items = await unitOfWork.ProjectDocumentChecklistRepository
            .GetByProjectIdAsync(request.ProcurementProjectId, cancellationToken);

        static ChecklistItemDto ToDto(Domain.Entities.Procurement.ProjectDocumentChecklist c) =>
            new()
            {
                Id           = c.Id,
                DocumentName = c.MasterDocumentType?.Name
                               ?? c.CustomDocumentName
                               ?? string.Empty,
                IsCustom             = c.MasterDocumentTypeId is null,
                IsRequired           = c.IsRequired,
                EnvelopeType         = c.EnvelopeType,
                OrderIndex           = c.OrderIndex,
                TemplateFileUrl      = c.MasterDocumentType?.TemplateFileUrl
                                       ?? c.CustomTemplateFileUrl,
                MasterDocumentTypeId = c.MasterDocumentTypeId
            };

        var env1 = items.Where(i => i.EnvelopeType == 1).OrderBy(i => i.OrderIndex).Select(ToDto).ToList();
        var env2 = items.Where(i => i.EnvelopeType == 2).OrderBy(i => i.OrderIndex).Select(ToDto).ToList();

        return ApiResponse<ProjectChecklistResponse>.Success(new ProjectChecklistResponse
        {
            ProjectId      = request.ProcurementProjectId,
            TotalActive    = items.Count(i => i.IsRequired),
            IsLocked       = project.ChecklistConfirmed
                             || ChecklistLockGuard.IsLocked(project.Status),
            Envelope1Items = env1,
            Envelope2Items = env2
        });
    }
}