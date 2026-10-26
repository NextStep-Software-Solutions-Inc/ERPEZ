// GetPublicApplicationStatusQueryHandler.cs
using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicApplicationStatus;

public class GetPublicApplicationStatusQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPublicApplicationStatusQuery, ApiResponse<PublicApplicationStatusDto>>
{
    public async Task<ApiResponse<PublicApplicationStatusDto>> Handle(
        GetPublicApplicationStatusQuery request, CancellationToken cancellationToken)
    {
        var application = await unitOfWork.PublicSupplierApplicationRepository
            .GetWithDocumentsByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Application not found.");

        var dto = new PublicApplicationStatusDto
        {
            Id                   = application.Id,
            ProcurementProjectId = application.ProcurementProjectId,
            ProjectTitle         = application.ProcurementProject.Title,
            CompanyName          = application.CompanyName,
            ContactPerson        = application.ContactPerson,
            EmailAddress         = application.EmailAddress,
            Status               = application.Status,
            SubmittedAt          = application.SubmittedAt,
            Documents = application.UploadedDocuments.Select(d => new SubmittedDocumentDto
            {
                ChecklistItemId  = d.ChecklistItemId,
                DocumentName     = d.ChecklistItem.MasterDocumentType?.Name
                                 ?? d.ChecklistItem.CustomDocumentName
                                 ?? string.Empty,
                OriginalFileName = d.OriginalFileName,
                UploadedAt       = d.UploadedAt
            }).ToList()
        };

        return ApiResponse<PublicApplicationStatusDto>.Success(dto);
    }
}