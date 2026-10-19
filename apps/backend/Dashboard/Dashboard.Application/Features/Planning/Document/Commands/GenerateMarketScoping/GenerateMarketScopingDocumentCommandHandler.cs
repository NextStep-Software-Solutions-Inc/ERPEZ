using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Common.Helpers;
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

        var settingsQuery = unitOfWork.MarketScopingActivitySettingsRepository.Query(x => x.IsActive && !x.IsDeleted);
        var allSettings = await unitOfWork.MarketScopingActivitySettingsRepository.ToListAsync(settingsQuery, cancellationToken);

        var officeId = form.TargetLineItemBudgetActivity?.LineItemBudget?.OfficeId
            ?? user?.OfficeId;

        var wf = await DocumentSignatoryResolver
            .ResolveWorkflowApproversAsync(unitOfWork, officeId, null, null, cancellationToken);

        var approver = wf.FinalApprover ?? wf.RecommendingApprover;

        var dataDto = MapToDto(form, user, allSettings, approver);

        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.MarketScoping, request.Format, cancellationToken);

        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"MarketScoping_{form.ProjectName.Replace(' ', '_')}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path = await storageService.SaveAsync(bytes, fileName, cancellationToken);

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

    private static MarketScopingDataDto MapToDto(
        MarketScoping form,
        ERPEZ.Domain.Entities.Planning.User? user,
        List<ERPEZ.Domain.Entities.Planning.MarketScopingActivitySettings> allSettings,
        ResolvedSignatory? approver = null)
    {
        var implementingUnit = user?.Office?.Name ?? string.Empty;
        var procuringEntity = string.IsNullOrWhiteSpace(user?.Office?.Organization?.Name) 
            ? "Name of Procuring Entity" 
            : user.Office.Organization.Name; 
        var repName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : string.Empty;
        var activePosition = user?.PersonnelPositions?.FirstOrDefault(p => p.IsActive)?.Position;
        var repDesignation = activePosition?.Title ?? string.Empty;

        var approvedByName = !string.IsNullOrWhiteSpace(approver?.FullName)
            ? approver.FullName
            : "Head, End-User or Implementing Unit";
        var approvedByPos = !string.IsNullOrWhiteSpace(approver?.PositionTitle)
            ? approver.PositionTitle
            : "Approver";

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
            
            Activities = allSettings
                .Select(s =>
                {
                    var matchingConducted = form.ActivitiesConducted
                        .FirstOrDefault(ac => ac.ActivitySettingsId == s.Id);
                    
                    var isChecked = matchingConducted != null;
                    var attachmentDocList = matchingConducted?.Attachments != null && matchingConducted.Attachments.Count != 0
                        ? string.Join("\n• ", matchingConducted.Attachments.Select(att => att.FileName))
                        : string.Empty;

                    if (!string.IsNullOrWhiteSpace(attachmentDocList))
                    {
                        attachmentDocList = "• " + attachmentDocList;
                    }

                    return new MarketScopingActivityDto
                    {
                        IsChecked = isChecked,
                        ActivityType = s.ActivityType,
                        Description = s.Label,
                        Documentation = isChecked && !string.IsNullOrWhiteSpace(attachmentDocList)
                            ? attachmentDocList
                            : string.Empty,
                        SortOrder = s.SortOrder
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
                PrintedName = approvedByName,
                Position = approvedByPos,
                Date = form.Status == StatusEnum.Approved ? DateTime.UtcNow : null
            }
        };
    }
}
