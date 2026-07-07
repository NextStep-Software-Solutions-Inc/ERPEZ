using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.CreateLIB;

public class CreateLIBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateLIBCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateLIBCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId!.Value, cancellationToken)
            ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

        if (!request.SourceId.HasValue)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("SourceId is required.");
        }

        var sourceType = request.SourceType;

        if (sourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase) &&
            !request.Scope.Equals("Activity", StringComparison.OrdinalIgnoreCase))
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("OPCR LIBs must use Activity scope.");
        }

        // -----------------------------------------------------------------------
        // Resolve source document + FiscalYearId.
        //
        // OPCR is always single-year: FiscalYearId comes from the request
        // (the validator enforces this when SourceType == "OPCR").
        //
        // WFP-sourced LIBs (externally funded projects) can be single-year or
        // multi-year. We derive the FY window from the WFP's own
        // ProjectStartDate/ProjectEndDate instead of trusting the client:
        //   - same year on both dates -> single-year WFP, FiscalYearId resolved
        //     to the matching FiscalYear entity.
        //   - different years         -> multi-year WFP, FiscalYearId stays null.
        // -----------------------------------------------------------------------
        Domain.Entities.Planning.FiscalYear? fiscalYear = null;
        Domain.Entities.Planning.WFP? wfp = null;
        var isMultiYearWfp = false;

        if (sourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase))
        {
            _ = await unitOfWork.OPCRRepository.GetByIdAsync(request.SourceId.Value, cancellationToken)
                ?? throw new NotFoundException($"OPCR source with ID {request.SourceId} not found.");

            fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId!.Value, cancellationToken)
                ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");
        }
        else
        {
            wfp = await unitOfWork.WFPRepository.GetByIdAsync(request.SourceId.Value, cancellationToken)
                ?? throw new NotFoundException($"WFP source with ID {request.SourceId} not found.");

            isMultiYearWfp = wfp.ProjectStartDate.Year != wfp.ProjectEndDate.Year;

            if (!isMultiYearWfp)
            {
                fiscalYear = await unitOfWork.FiscalYearRepository.FindAsync(
                        fy => fy.Year == wfp.ProjectStartDate.Year, cancellationToken)
                    ?? throw new NotFoundException($"No Fiscal Year configured for year {wfp.ProjectStartDate.Year}.");
            }
            // multi-year WFP: fiscalYear stays null -> LIB.FiscalYearId will be null.
        }

        // -----------------------------------------------------------------------
        // Branch: top-down vs bottom-up (FundSourceId / AgencyMasterBudgetId).
        // -----------------------------------------------------------------------
        Guid fundSourceId;
        Guid? agencyMasterBudgetId;
        string status;

        if (request.AgencyMasterBudgetId.HasValue)
        {
            var agencyMasterBudget = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(
                    request.AgencyMasterBudgetId.Value, cancellationToken)
                ?? throw new NotFoundException($"Agency Master Budget with ID {request.AgencyMasterBudgetId} not found.");

            if (fiscalYear is null || agencyMasterBudget.FiscalYearId != fiscalYear.Id)
            {
                throw new ERPEZ.Shared.Exceptions.ValidationException(
                    "The Agency Master Budget's Fiscal Year does not match the LIB's Fiscal Year.");
            }

            var hasOfficeCeiling = await unitOfWork.OfficeCeilingRepository.ExistsAsync(
                oc => oc.OfficeId == request.OfficeId && oc.AgencyMasterBudgetId == agencyMasterBudget.Id,
                cancellationToken);

            if (!hasOfficeCeiling)
            {
                throw new NotFoundException(
                    $"No Office Ceiling exists for Office {request.OfficeId} under this Agency Master Budget.");
            }

            fundSourceId = agencyMasterBudget.FundSourceId;
            agencyMasterBudgetId = agencyMasterBudget.Id;
            status = "Draft";
        }
        else
        {
            if (!request.FundSourceId.HasValue)
            {
                throw new ERPEZ.Shared.Exceptions.ValidationException("FundSourceId is required when AgencyMasterBudgetId is not provided.");
            }

            _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId.Value, cancellationToken)
                ?? throw new NotFoundException($"Fund Source with ID {request.FundSourceId} not found.");

            fundSourceId = request.FundSourceId.Value;
            agencyMasterBudgetId = null;
            status = "Proposed";
        }

        if (request.ParentLIBId.HasValue)
        {
            _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.ParentLIBId.Value, cancellationToken)
                ?? throw new NotFoundException($"Parent LIB with ID {request.ParentLIBId} not found.");
        }

        if (request.ConsolidatedIntoLIBId.HasValue)
        {
            _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.ConsolidatedIntoLIBId.Value, cancellationToken)
                ?? throw new NotFoundException($"Consolidated-Into LIB with ID {request.ConsolidatedIntoLIBId} not found.");
        }

        // -----------------------------------------------------------------------
        // Uniqueness: one active (non-"Proposed") LIB per source document.
        // SourceId alone already scopes this correctly:
        //   - an OPCR is 1:1 with (Office, FiscalYear), so this still enforces
        //     "one active LIB per Office+FY" for OPCR-sourced LIBs.
        //   - a WFP project is its own document regardless of FY span, so two
        //     different WFPs in the same Office+FY no longer falsely collide,
        //     while the SAME WFP still can't spawn two active LIBs.
        // -----------------------------------------------------------------------
        var existingActive = await unitOfWork.LineItemBudgetRepository.FindAsync(
            x => x.SourceType == sourceType
                 && x.SourceId == request.SourceId
                 && x.Status != "Proposed"
                 && !x.IsDeleted,
            cancellationToken);
        if (existingActive != null)
        {
            throw new ConflictException($"An active LIB already exists for this {sourceType} source.");
        }

        // -----------------------------------------------------------------------
        // LIBNumber generation.
        //   OPCR (always single-year): LIB-{OfficeCode}-{Year}
        //   WFP, single-year:          LIB-{OfficeCode}-WFP-{Year}-{SourceId:8}
        //   WFP, multi-year:           LIB-{OfficeCode}-WFP-{StartYear}-{EndYear}-{SourceId:8}
        // The SourceId fragment prevents collisions between two different WFPs
        // that happen to share the same office and year(s).
        // -----------------------------------------------------------------------
        var sourceIdFragment = request.SourceId.Value.ToString("N")[..8];
        var libNumber = sourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase)
            ? $"LIB-{office.Code}-{fiscalYear!.Year}"
            : isMultiYearWfp
                ? $"LIB-{office.Code}-WFP-{wfp!.ProjectStartDate.Year}-{wfp.ProjectEndDate.Year}-{sourceIdFragment}"
                : $"LIB-{office.Code}-WFP-{fiscalYear!.Year}-{sourceIdFragment}";

        var entity = new Domain.Entities.Planning.LineItemBudget
        {
            FiscalYearId = fiscalYear?.Id,
            FundSourceId = fundSourceId,
            AgencyMasterBudgetId = agencyMasterBudgetId,
            OfficeId = request.OfficeId,
            ParentLIBId = request.ParentLIBId,
            Scope = request.Scope,
            Name = request.Name,
            LIBNumber = libNumber,
            Level = request.Level,
            SourceType = sourceType,
            SourceId = request.SourceId,
            Status = status,
            ConsolidatedIntoLIBId = request.ConsolidatedIntoLIBId,
            Version = 1
        };

        await unitOfWork.LineItemBudgetRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "LIB created successfully.");
    }
}