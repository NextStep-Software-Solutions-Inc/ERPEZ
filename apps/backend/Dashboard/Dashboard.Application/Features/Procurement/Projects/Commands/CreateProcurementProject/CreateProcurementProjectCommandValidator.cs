using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public class CreateProcurementProjectCommandValidator : AbstractValidator<CreateProcurementProjectCommand>
{
    private readonly IUnitOfWork unitOfWork;

    public CreateProcurementProjectCommandValidator(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;

        RuleFor(x => x.Title)
            .MaximumLength(500)
            .WithMessage("Project title cannot exceed 500 characters.");

        RuleFor(x => x.ResolutionNumber)
            .NotEmpty().WithMessage("Resolution Number is required.")
            .Length(3, 50).WithMessage("Resolution Number must be between 3 and 50 characters.");

        RuleFor(x => x.ResolutionType)
            .NotEmpty().WithMessage("Resolution Type is required.")
            .MaximumLength(50).WithMessage("Resolution Type cannot exceed 50 characters.");

        RuleFor(x => x.ResolvedLocation)
            .NotEmpty().WithMessage("Resolved Location is required.")
            .MaximumLength(200).WithMessage("Resolved Location cannot exceed 200 characters.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");

        RuleFor(x => x.DateResolved)
            .LessThanOrEqualTo(DateTime.UtcNow.AddMinutes(5))
            .WithMessage("Date Resolved cannot be in the future.");

        // Rule 1: Source Selection (Exactly One)
        RuleFor(x => x)
            .Must(x => (x.APPItemId.HasValue && !x.ConsolidatedPRId.HasValue) || (!x.APPItemId.HasValue && x.ConsolidatedPRId.HasValue))
            .WithMessage("Either APP Item or Consolidated PR may be specified, but not both.");

        // Rule 2: SourceType Consistency
        RuleFor(x => x)
            .Must(x => (x.SourceType == ProcurementProjectSourceType.AppItem && x.APPItemId.HasValue) || 
                       (x.SourceType == ProcurementProjectSourceType.ConsolidatedPR && x.ConsolidatedPRId.HasValue))
            .WithMessage("SourceType must match the provided source identifier.");

        // Rule 3 & 4: APP Item Eligibility and Duplicate prevention
        RuleFor(x => x.APPItemId)
            .MustAsync(BeEligibleAPPItem)
            .WithMessage("The selected APP Item is either not found, not approved, or already linked to a project.")
            .When(x => x.SourceType == ProcurementProjectSourceType.AppItem && x.APPItemId.HasValue);

        // Rule 3 & 4: Consolidated PR Eligibility and Duplicate prevention
        RuleFor(x => x.ConsolidatedPRId)
            .MustAsync(BeEligibleConsolidatedPR)
            .WithMessage("The selected Consolidated PR is either not found, not approved, or already linked to a project.")
            .When(x => x.SourceType == ProcurementProjectSourceType.ConsolidatedPR && x.ConsolidatedPRId.HasValue);
            
        // Rule 5: Unique Resolution Number
        RuleFor(x => x.ResolutionNumber)
            .MustAsync(BeUniqueResolutionNumber)
            .WithMessage("A duplicate Resolution Number already exists.");
    }

    private async Task<bool> BeEligibleAPPItem(Guid? appItemId, CancellationToken cancellationToken)
    {
        if (!appItemId.HasValue) return true;

        var appItem = await unitOfWork.APPItemRepository.GetByIdAsync(appItemId.Value, cancellationToken);
        if (appItem == null) return false;

        // Verify parent APP status is Approved
        var app = await unitOfWork.APPRepository.GetByIdAsync(appItem.APPId, cancellationToken);
        if (app == null || app.Status != StatusEnum.Approved)
        {
            return false;
        }

        // Verify APP Item is not already linked to an active project
        var exists = await unitOfWork.ProcurementProjectRepository.FindAsync(
            p => p.APPItemId == appItemId.Value && p.Status != "Cancelled" && !p.IsDeleted, cancellationToken);
        return exists == null;
    }

    private async Task<bool> BeEligibleConsolidatedPR(Guid? consolidatedPrId, CancellationToken cancellationToken)
    {
        if (!consolidatedPrId.HasValue) return true;

        var cpr = await unitOfWork.ConsolidatedPRRepository.GetByIdAsync(consolidatedPrId.Value, cancellationToken);
        if (cpr == null || cpr.Status != StatusEnum.Approved)
        {
            return false;
        }

        // Verify Consolidated PR is not already linked to an active project
        var exists = await unitOfWork.ProcurementProjectRepository.FindAsync(
            p => p.ConsolidatedPRId == consolidatedPrId.Value && p.Status != "Cancelled" && !p.IsDeleted, cancellationToken);
        return exists == null;
    }

    private async Task<bool> BeUniqueResolutionNumber(string resolutionNumber, CancellationToken cancellationToken)
    {
        var exists = await unitOfWork.BACResolutionRepository.FindAsync(
            r => r.ResolutionNumber == resolutionNumber && !r.IsDeleted, cancellationToken);
        return exists == null;
    }
}
