using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateMarketScoping;

public class GenerateMarketScopingDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService)
    : IRequestHandler<GenerateMarketScopingDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateMarketScopingDocumentCommand request,
        CancellationToken cancellationToken)
    {
        var form = await unitOfWork.MarketScopingRepository
            .GetByIdWithDetailsAsync(request.MarketScopingId, cancellationToken)
            ?? throw new NotFoundException("Market Scoping form not found.");

        var user = await unitOfWork.UserRepository.GetByIdWithOfficeAsync(form.UserId, cancellationToken);

        var dataDto = MapToDto(form, user);

        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.MarketScoping, request.Format, cancellationToken);

        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"MarketScoping_{form.ProjectName.Replace(' ', '_')}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        // Try to get OfficeId from the user explicitly
        var officeId = form.TargetLineItemBudgetActivity?.LineItemBudget?.OfficeId 
            ?? user?.OfficeId;
            
        if (officeId == null)
        {
            throw new ValidationException("Cannot determine OfficeId for the Market Scoping Form. The user must be assigned to an office.");
        }

        var record = new ERPEZ.Domain.Entities.Planning.GeneratedDocument
        {
            DocumentType = DocumentType.MarketScoping, // Assuming DocumentType.MarketScoping exists
            Format = request.Format,
            OfficeId = officeId.Value,
            StoragePath = path,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = DateTime.UtcNow.Year.ToString(),
            GeneratedBy = request.GeneratedBy,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "Market Scoping document generated successfully.");
    }

    private static MarketScopingDataDto MapToDto(MarketScoping form, ERPEZ.Domain.Entities.Planning.User? user)
    {
        var implementingUnit = user?.Office?.Name ?? string.Empty;
        var procuringEntity = string.IsNullOrWhiteSpace(user?.Office?.Organization?.Name) 
            ? "Name of Procuring Entity" 
            : user.Office.Organization.Name; 
        var repName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : string.Empty;
        var activePosition = user?.PersonnelPositions?.FirstOrDefault(p => p.IsActive)?.Position;
        var repDesignation = activePosition?.Title ?? string.Empty;

        return new MarketScopingDataDto
        {
            ProcuringEntity = procuringEntity,
            ImplementingUnit = implementingUnit,
            RepresentativeNameAndDesignation = string.IsNullOrWhiteSpace(repDesignation) ? repName : $"{repName} / {repDesignation}",
            ProjectName = form.ProjectName,
            EstimatedBudget = form.EstimatedBudget,
            PeriodFrom = form.PeriodFrom,
            PeriodTo = form.PeriodTo,
            ExpectedDeliveryDate = form.DeliveryDate,
            
            Activities = form.ActivitiesConducted
                .Where(a => a.ActivitySettings != null)
                .Select(a =>
                {
                    var attachmentDocList = a.Attachments != null && a.Attachments.Count != 0
                        ? string.Join("\n• ", a.Attachments.Select(att => att.FileName))
                        : string.Empty;
                        
                    if (!string.IsNullOrWhiteSpace(attachmentDocList))
                    {
                        attachmentDocList = "• " + attachmentDocList;
                    }

                    return new MarketScopingActivityDto
                    {
                        IsChecked = true,
                        ActivityType = a.ActivitySettings.ActivityType,
                        Description = a.ActivitySettings.Label,
                        Documentation = !string.IsNullOrWhiteSpace(attachmentDocList)
                            ? attachmentDocList
                            : (a.ActivitySettings.Description ?? string.Empty),
                        SortOrder = a.ActivitySettings.SortOrder
                    };
                })
                .OrderBy(a => a.SortOrder)
                .ToList(),

            Parameters = form.ParameterEvaluations
                .Where(p => p.ParameterSettings != null)
                .Select(p => new MarketScopingParameterDto
                {
                    ParameterName = p.ParameterSettings.Name,
                    GuidedQuestion = p.ParameterSettings.GuidedQuestion,
                    Considered = p.IsConsidered.HasValue 
                        ? (p.IsConsidered.Value ? "Yes" : "No") 
                        : "Not Applicable",
                    Recommendations = p.Remarks,
                    SortOrder = p.ParameterSettings.SortOrder
                })
                .OrderBy(p => p.SortOrder)
                .ToList(),

            PreparedBy = new SignatoryDto
            {
                PrintedName = repName,
                Position = repDesignation,
                Date = DateTime.UtcNow // Use actual preparation date if available
            },
            
            ApprovedBy = new SignatoryDto
            {
                PrintedName = "Head, End-User or Implementing Unit", // This might need to come from workflow/approval events
                Position = "Approver",
                Date = form.Status == StatusEnum.Approved ? DateTime.UtcNow : null
            }
        };
    }
}
