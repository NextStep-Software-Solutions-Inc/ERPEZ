using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.ValidateForAssignment;

/// <summary>
/// Validates if all activated KPIs for a fiscal year have targets set
/// and are ready for office assignment.
/// </summary>
public class ValidateForAssignmentQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<ValidateForAssignmentQuery, ApiResponse<ValidationResult>>
{
    public async Task<ApiResponse<ValidationResult>> Handle(ValidateForAssignmentQuery request, CancellationToken cancellationToken)
    {
        // Validate Fiscal Year exists
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        // Get all activated KPIs for this fiscal year
        var query = unitOfWork.FYActiveKPIRepository.Query(f => f.FiscalYearId == request.FiscalYearId);
        var allKPIs = await unitOfWork.FYActiveKPIRepository.ToListAsync(query, cancellationToken);

        var kpisWithoutTargets = allKPIs
            .Where(k => k.AgencyTargetAnnual == 0 || k.Status == nameof(Domain.Enums.FYActiveKPIStatus.Draft))
            .Select(k => new KPIWithoutTarget
            {
                Id = k.Id,
                Code = k.Code,
                Name = k.Name,
                Status = k.Status
            })
            .ToList();

        var result = new ValidationResult
        {
            IsValid = kpisWithoutTargets.Count == 0,
            TotalKPIs = allKPIs.Count,
            KPIsWithTargets = allKPIs.Count - kpisWithoutTargets.Count,
            KPIsWithoutTargets = kpisWithoutTargets.Count,
            KPIsNeedingTargets = kpisWithoutTargets
        };

        string message = result.IsValid
            ? $"All {result.TotalKPIs} activated KPIs have targets set and are ready for office assignment."
            : $"{result.KPIsWithoutTargets} out of {result.TotalKPIs} activated KPIs still need targets (Status: Draft or AgencyTargetAnnual = 0). Use PUT /fy-active-kpis/targets/bulk to set targets.";

        return ApiResponse<ValidationResult>.Success(result, message);
    }
}
