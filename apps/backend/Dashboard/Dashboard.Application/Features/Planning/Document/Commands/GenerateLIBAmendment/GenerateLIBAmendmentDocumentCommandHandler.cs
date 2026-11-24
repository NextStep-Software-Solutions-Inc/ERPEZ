using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

using LibEntity = ERPEZ.Domain.Entities.Planning.LineItemBudget;
using DetailEntity = ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIBAmendment;

public class GenerateLIBAmendmentDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GenerateLIBAmendmentDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateLIBAmendmentDocumentCommand request,
        CancellationToken                         cancellationToken)
    {
        var amendment = await unitOfWork.LIBAmendmentRequestRepository.GetByIdAsync(request.AmendmentRequestId, cancellationToken)
            ?? throw new NotFoundException("LIB Amendment Request not found.");

        var originalLib = await unitOfWork.LineItemBudgetRepository.GetByIdWithDetailsAsync(amendment.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException("Original Line Item Budget not found.");

        var proposedLib = await unitOfWork.LineItemBudgetRepository.GetByIdWithDetailsAsync(amendment.ProposedLineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException("Proposed Line Item Budget not found.");

        var signatories = await BuildSignatoriesAsync(originalLib, cancellationToken);
        var dataDto = MapToLibAmendmentDataDto(amendment, originalLib, proposedLib, signatories);

        var bytes = await rendererService.RenderAsync(dataDto, DocumentType.BudgetModification, request.Format, cancellationToken);
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"LIBAmendment_{dataDto.FiscalYear}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.BudgetModification,
            Format        = request.Format,
            OfficeId      = originalLib.OfficeId ?? Guid.Empty,
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = dataDto.FiscalYear,
            GeneratedBy   = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "LIB Amendment document generated successfully.");
    }

    private async Task<List<SignatoryDto>> BuildSignatoriesAsync(
        LibEntity originalLib,
        CancellationToken cancellationToken)
    {
        var wf = await DocumentSignatoryResolver
            .ResolveWorkflowApproversAsync(unitOfWork, originalLib.OfficeId, originalLib.FiscalYearId, "LIB", cancellationToken);

        var officeHead = await DocumentSignatoryResolver
            .ResolveOfficeHeadSignatoryAsync(unitOfWork, originalLib.OfficeId, cancellationToken);

        var finance = await DocumentSignatoryResolver
            .ResolveFinanceSignatoryAsync(unitOfWork, cancellationToken);

        var preparedByName = !string.IsNullOrWhiteSpace(originalLib.CreatedBy)
            ? originalLib.CreatedBy
            : (officeHead?.FullName ?? wf.RecommendingApprover?.FullName ?? "Engr. Alex L. Maureal");
        var preparedByPos = officeHead?.PositionTitle ?? originalLib.Office?.Name ?? wf.RecommendingApprover?.PositionTitle ?? "Head, Innovation and Technology Solutions Division";

        var financeName = !string.IsNullOrWhiteSpace(finance?.FullName) ? finance.FullName : "Cherry Ann S. Villarte, CPA";
        var financePos = !string.IsNullOrWhiteSpace(finance?.PositionTitle) ? finance.PositionTitle : "Director, Finance Division";

        var recName = !string.IsNullOrWhiteSpace(wf.RecommendingApprover?.FullName) ? wf.RecommendingApprover.FullName : "Atty. Dionel O. Albina";
        var recPos = !string.IsNullOrWhiteSpace(wf.RecommendingApprover?.PositionTitle) ? wf.RecommendingApprover.PositionTitle : "Chancellor, USTP CDO";

        var finalName = !string.IsNullOrWhiteSpace(wf.FinalApprover?.FullName) ? wf.FinalApprover.FullName : "Dr. Ambrosio B. Cultura II";
        var finalPos = !string.IsNullOrWhiteSpace(wf.FinalApprover?.PositionTitle) ? wf.FinalApprover.PositionTitle : "System President";

        return
        [
            new ERPEZ.Application.Common.Dtos.SignatoryDto { Label = "Prepared by:", PrintedName = preparedByName, Position = preparedByPos },
            new ERPEZ.Application.Common.Dtos.SignatoryDto { Label = "Certified by:", PrintedName = financeName, Position = financePos },
            new ERPEZ.Application.Common.Dtos.SignatoryDto { Label = "Recommended by:", PrintedName = recName, Position = recPos },
            new ERPEZ.Application.Common.Dtos.SignatoryDto { Label = "Approved by:", PrintedName = finalName, Position = finalPos }
        ];
    }

    private static LibAmendmentDataDto MapToLibAmendmentDataDto(
        LIBAmendmentRequest amendment, 
        LibEntity originalLib, 
        LibEntity proposedLib,
        List<ERPEZ.Application.Common.Dtos.SignatoryDto>? signatories = null)
    {
        return new LibAmendmentDataDto
        {
            LIBNumber = proposedLib.LIBNumber ?? string.Empty,
            OfficeName = originalLib.Office?.Name ?? string.Empty,
            FiscalYear = originalLib.FiscalYearEntity?.Year.ToString() ?? string.Empty,
            ReasonCode = amendment.Reason,
            Justification = amendment.Justification,
            ApprovedBudget = MapBudgetSection(originalLib),
            ProposedBudget = MapBudgetSection(proposedLib),
            Signatories = signatories ?? []
        };
    }

    private static BudgetSectionDto MapBudgetSection(LibEntity lib)
    {
        var section = new BudgetSectionDto();
        
        var firstActivity = lib.LineItemBudgetActivities.FirstOrDefault();
        if (firstActivity != null)
        {
            var opcrItem     = firstActivity.OPCRActivity?.OPCRItem;
            var fyActiveKpi  = opcrItem?.KPIAssignment?.FYActiveKPI;
            var wfpObjective = firstActivity.WFPObjectiveActivity?.WFPObjective;

            section.PREXC = fyActiveKpi?.MFOPAP?.Name ?? fyActiveKpi?.Name ?? wfpObjective?.Description ?? firstActivity.Name;
            section.Goal = firstActivity.OPCRActivity?.Description ?? wfpObjective?.Outcome ?? string.Empty;
        }

        var activities = lib.LineItemBudgetActivities.ToList();
        var standaloneDetails = lib.LineItemBudgetDetails.Where(d => d.LineItemBudgetActivityId is null).ToList();

        var apiGroups = activities.Select(a => MapApiGroup(a.Name, a.LineItemBudgetDetails)).ToList();
        if (standaloneDetails.Count > 0)
        {
            apiGroups.Add(MapApiGroup("General", standaloneDetails));
        }

        section.ApiGroups = apiGroups;
        section.GrandTotal = apiGroups.Sum(g => g.SubTotal);

        return section;
    }

    private static ApiGroupDto MapApiGroup(string name, IEnumerable<DetailEntity> details)
    {
        var expenses = details
            .GroupBy(d => !string.IsNullOrWhiteSpace(d.WFPObjectiveActivityExpenditure?.ItemDescription) 
                ? d.WFPObjectiveActivityExpenditure!.ItemDescription 
                : d.Object?.Name ?? "Unknown")
            .Select(g => new ExpenseRowDto
            {
                ExpenseItemName = g.Key,
                Q1Budget = g.Sum(d => GetQuarterBudget(d, 1)),
                Q2Budget = g.Sum(d => GetQuarterBudget(d, 2)),
                Q3Budget = g.Sum(d => GetQuarterBudget(d, 3)),
                Q4Budget = g.Sum(d => GetQuarterBudget(d, 4)),
                TotalBudget = g.Sum(d => d.Budget)
            }).ToList();

        return new ApiGroupDto
        {
            ActivityName = name,
            Expenses = expenses,
            SubTotal = expenses.Sum(e => e.TotalBudget)
        };
    }

    private static decimal GetQuarterBudget(DetailEntity detail, int quarter)
    {
        if (detail.StartDate is null)
        {
            if (string.Equals(detail.TimelineType, "Quarterly", StringComparison.OrdinalIgnoreCase))
                return detail.Budget / 4m;

            if (string.Equals(detail.TimelineType, "Monthly", StringComparison.OrdinalIgnoreCase))
                return detail.Budget / 4m;

            return quarter == 1 ? detail.Budget : 0m;
        }

        var detailQuarter = (detail.StartDate.Value.Month - 1) / 3 + 1;
        return detailQuarter == quarter ? detail.Budget : 0m;
    }
}
