using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProjectSupplierApplications;

public record GetProjectSupplierApplicationsQuery(Guid ProjectId) : IRequest<ApiResponse<List<ProjectSupplierApplicationDto>>>;

public record ProjectSupplierApplicationDto
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public string? SupplierCategory { get; init; }
    public string? ContactPerson { get; init; }
    public string? ContactNumber { get; init; }
    public string? Email { get; init; }
    public string? TinNumber { get; init; }
    public string? BusinessAddress { get; init; }
    public string EvaluationStatus { get; init; } = string.Empty;
    public DateTime SubmittedAt { get; init; }
    public decimal TotalBidAmount { get; init; }
    public string? Remarks { get; init; }
    public string? EvaluatedBy { get; init; }
    public DateTime? EvaluatedAt { get; init; }
    public List<ApplicationDocumentDto> Documents { get; init; } = [];
}

public record ApplicationDocumentDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public long Size { get; init; }
    public DateTime UploadedAt { get; init; }
    public string? Url { get; init; }
}

public class GetProjectSupplierApplicationsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProjectSupplierApplicationsQuery, ApiResponse<List<ProjectSupplierApplicationDto>>>
{
    public async Task<ApiResponse<List<ProjectSupplierApplicationDto>>> Handle(
        GetProjectSupplierApplicationsQuery request, CancellationToken cancellationToken)
    {
        var applications = await unitOfWork.PublicSupplierApplicationRepository.Query()
            .Include(a => a.UploadedDocuments)
                .ThenInclude(d => d.ChecklistItem)
                    .ThenInclude(c => c.MasterDocumentType)
            .Where(a => a.ProcurementProjectId == request.ProjectId && !a.IsDeleted)
            .OrderByDescending(a => a.SubmittedAt)
            .ToListAsync(cancellationToken);

        var result = applications.Select(a => new ProjectSupplierApplicationDto
        {
            Id = a.Id,
            ProjectId = a.ProcurementProjectId,
            SupplierName = a.CompanyName,
            ContactPerson = a.ContactPerson,
            ContactNumber = a.ContactNumber,
            Email = a.EmailAddress,
            TinNumber = a.TinNumber,
            BusinessAddress = a.BusinessAddress,
            EvaluationStatus = NormalizeStatus(a.Status),
            SubmittedAt = a.SubmittedAt,
            TotalBidAmount = 0,
            Remarks = a.Remarks,
            EvaluatedBy = a.EvaluatedBy,
            EvaluatedAt = a.EvaluatedAt,
            Documents = a.UploadedDocuments.Select(d => new ApplicationDocumentDto
            {
                Id = d.Id,
                Name = d.ChecklistItem?.MasterDocumentType?.Name ?? d.OriginalFileName,
                Type = System.IO.Path.GetExtension(d.OriginalFileName).TrimStart('.').ToUpperInvariant(),
                Size = 0,
                UploadedAt = d.UploadedAt,
                Url = d.BlobStorageUrl
            }).ToList()
        }).ToList();

        return ApiResponse<List<ProjectSupplierApplicationDto>>.Success(result);
    }

    private static string NormalizeStatus(string status)
    {
        return status?.Trim().ToLowerInvariant() switch
        {
            "passed" or "responsive" => "Passed",
            "failed" or "disqualified" => "Failed",
            _ => "Pending"
        };
    }
}
