using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.AddCustomRequirement;

public class AddCustomRequirementCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<AddCustomRequirementCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        AddCustomRequirementCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
                          .GetByIdAsync(request.ProcurementProjectId, cancellationToken)
                      ?? throw new NotFoundException("Procurement project not found.");

        ChecklistLockGuard.ThrowIfLocked(project.Status);

        string? url = null;
        if (request.FileId.HasValue)
        {
            var (promotedUrl, _) = await fileStorageService.PromoteFileAsync(request.FileId.Value, cancellationToken);
            url = promotedUrl;
        }

        var item = new Domain.Entities.Procurement.ProjectDocumentChecklist
        {
            Id                   = Guid.NewGuid(),
            ProcurementProjectId = request.ProcurementProjectId,
            MasterDocumentTypeId = null,
            CustomDocumentName   = request.CustomDocumentName,
            CustomTemplateFileUrl  = url,
            EnvelopeType         = request.EnvelopeType,
            IsRequired           = true,
            OrderIndex           = request.OrderIndex,
            CreatedAt            = DateTime.UtcNow
        };

        await unitOfWork.ProjectDocumentChecklistRepository.AddAsync(item, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(item.Id, "Custom requirement added to project checklist.");
    }
}