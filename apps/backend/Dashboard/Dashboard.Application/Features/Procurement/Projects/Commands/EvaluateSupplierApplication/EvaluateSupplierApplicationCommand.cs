using ERPEZ.Application.Features.Procurement.Projects.Queries.GetProjectSupplierApplications;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.EvaluateSupplierApplication;

public record EvaluateSupplierApplicationRequest
{
    public string EvaluationStatus { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public string? EvaluatedBy { get; init; }
}

public record EvaluateSupplierApplicationCommand : IRequest<ApiResponse<ProjectSupplierApplicationDto>>
{
    public Guid ProjectId { get; init; }
    public Guid ApplicationId { get; init; }
    public EvaluateSupplierApplicationRequest Request { get; init; } = new();
}

public class EvaluateSupplierApplicationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<EvaluateSupplierApplicationCommand, ApiResponse<ProjectSupplierApplicationDto>>
{
    public async Task<ApiResponse<ProjectSupplierApplicationDto>> Handle(
        EvaluateSupplierApplicationCommand command, CancellationToken cancellationToken)
    {
        var application = await unitOfWork.PublicSupplierApplicationRepository.Query()
            .Include(a => a.UploadedDocuments)
                .ThenInclude(d => d.ChecklistItem)
                    .ThenInclude(c => c.MasterDocumentType)
            .FirstOrDefaultAsync(
                a => a.Id == command.ApplicationId && a.ProcurementProjectId == command.ProjectId && !a.IsDeleted,
                cancellationToken)
            ?? throw new NotFoundException("Supplier application not found.");

        var normalizedStatus = command.Request.EvaluationStatus?.Trim();
        if (string.IsNullOrEmpty(normalizedStatus))
        {
            throw new ValidationException("Evaluation status is required.");
        }

        if (string.Equals(normalizedStatus, "Failed", StringComparison.OrdinalIgnoreCase) &&
            string.IsNullOrWhiteSpace(command.Request.Remarks))
        {
            throw new ValidationException("Remarks are required when marking an application as Failed.");
        }

        application.Status = normalizedStatus;
        application.Remarks = command.Request.Remarks;
        application.EvaluatedBy = command.Request.EvaluatedBy ?? "BAC Officer";
        application.EvaluatedAt = DateTime.UtcNow;
        application.UpdatedAt = DateTime.UtcNow;

        unitOfWork.PublicSupplierApplicationRepository.Update(application);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ProjectSupplierApplicationDto
        {
            Id = application.Id,
            ProjectId = application.ProcurementProjectId,
            SupplierName = application.CompanyName,
            ContactPerson = application.ContactPerson,
            ContactNumber = application.ContactNumber,
            Email = application.EmailAddress,
            TinNumber = application.TinNumber,
            BusinessAddress = application.BusinessAddress,
            EvaluationStatus = application.Status,
            SubmittedAt = application.SubmittedAt,
            TotalBidAmount = 0,
            Remarks = application.Remarks,
            EvaluatedBy = application.EvaluatedBy,
            EvaluatedAt = application.EvaluatedAt,
            Documents = application.UploadedDocuments.Select(d => new ApplicationDocumentDto
            {
                Id = d.Id,
                Name = d.ChecklistItem?.MasterDocumentType?.Name ?? d.OriginalFileName,
                Type = System.IO.Path.GetExtension(d.OriginalFileName).TrimStart('.').ToUpperInvariant(),
                Size = 0,
                UploadedAt = d.UploadedAt,
                Url = d.BlobStorageUrl
            }).ToList()
        };

        return ApiResponse<ProjectSupplierApplicationDto>.Success(dto, $"Application marked as {application.Status} successfully.");
    }
}
