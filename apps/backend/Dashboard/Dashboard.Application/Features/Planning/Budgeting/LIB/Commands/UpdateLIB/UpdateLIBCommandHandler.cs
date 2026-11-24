using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIB;

public class UpdateLIBCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUser,
    IUserAuthorizationService authorizationService,
    ITenantContextService tenantContext)
    : IRequestHandler<UpdateLIBCommand, ApiResponse<Unit>>
{
    private static readonly HashSet<string> editableStatuses =
        new(StringComparer.OrdinalIgnoreCase) { "Proposed", "Draft", "Returned" };

    public async Task<ApiResponse<Unit>> Handle(UpdateLIBCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var entity = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {command.Id} not found.");

        // ── Layer 3: Fail-Closed Office Resource Scoping Guard ─────────────
        if (!currentUser.IsSuperAdmin)
        {
            var hasGlobalAccess = await authorizationService.HasPermissionAsync(
                currentUser.ExternalIdentityId ?? string.Empty,
                tenantContext.TenantId,
                Permissions.Planning.viewGlobalDashboard,
                cancellationToken);

            if (!hasGlobalAccess)
            {
                if (!currentUser.OfficeId.HasValue || entity.OfficeId != currentUser.OfficeId.Value)
                {
                    throw new ForbiddenException("You cannot modify a Line Item Budget outside your assigned Office.");
                }
            }
        }

        // ── 1. Status gate: only Proposed/Draft/Returned LIBs are editable ────
        if (!editableStatuses.Contains(entity.Status))
        {
            throw new ValidationException(
                $"Only LIBs with status 'Proposed', 'Draft', or 'Returned' can be edited. " +
                $"Current status: '{entity.Status}'.");
        }

        // ── 2. Once linked to an AgencyMasterBudget, FundSource/FiscalYear/Office
        //      are frozen — changing them would silently break the FY/FundSource
        //      match and OfficeCeiling linkage enforced at link time. ──────────
        if (entity.AgencyMasterBudgetId.HasValue &&
            (request.FundSourceId.HasValue || request.FiscalYearId.HasValue || request.OfficeId.HasValue))
        {
            throw new ValidationException(
                "FundSource, FiscalYear, and Office cannot be changed once a LIB is linked to an Agency Master Budget.");
        }

        // ── Validate referenced entities only when the field is provided ─────

        if (request.FiscalYearId.HasValue)
        {
            if (await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId.Value, cancellationToken) is null)
                throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");
        }

        if (request.FundSourceId.HasValue)
        {
            if (await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId.Value, cancellationToken) is null)
                throw new NotFoundException($"Fund Source with ID {request.FundSourceId} not found.");
        }

        if (request.OfficeId.HasValue)
        {
            if (await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId.Value, cancellationToken) is null)
                throw new NotFoundException($"Office with ID {request.OfficeId} not found.");
        }

        // ── 3. ParentLIBId: must exist, and cannot self-reference ────────────
        if (request.ParentLIBId.HasValue)
        {
            if (request.ParentLIBId.Value == command.Id)
                throw new ValidationException("A LIB cannot be its own parent.");

            if (await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.ParentLIBId.Value, cancellationToken) is null)
                throw new NotFoundException($"Parent LIB with ID {request.ParentLIBId} not found.");
        }

        // ── 4. ConsolidatedIntoLIBId: must exist, and cannot self-reference ──
        if (request.ConsolidatedIntoLIBId.HasValue)
        {
            if (request.ConsolidatedIntoLIBId.Value == command.Id)
                throw new ValidationException("A LIB cannot be consolidated into itself.");

            if (await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.ConsolidatedIntoLIBId.Value, cancellationToken) is null)
                throw new NotFoundException($"Consolidated-Into LIB with ID {request.ConsolidatedIntoLIBId} not found.");
        }

        // ── SourceType + SourceId: validate together only when either is provided,
        //    and re-check the same uniqueness rule enforced at creation so a
        //    reassignment can't silently collide with another LIB on the same source.

        var effectiveSourceType = request.SourceType ?? entity.SourceType;
        var effectiveSourceId   = request.SourceId   ?? entity.SourceId;

        if (request.SourceType is not null || request.SourceId.HasValue)
        {
            if (effectiveSourceId is null)
                throw new ValidationException("SourceId is required when updating SourceType.");

            var sourceId = effectiveSourceId.Value;

            if (effectiveSourceType?.Equals("OPCR", StringComparison.OrdinalIgnoreCase) == true)
            {
                if (await unitOfWork.OPCRRepository.GetByIdAsync(sourceId, cancellationToken) is null)
                    throw new NotFoundException($"OPCR source with ID {sourceId} not found.");
            }
            else
            {
                if (await unitOfWork.WFPRepository.GetByIdAsync(sourceId, cancellationToken) is null)
                    throw new NotFoundException($"WFP source with ID {sourceId} not found.");
            }

            var duplicateSource = await unitOfWork.LineItemBudgetRepository.FindAsync(
                x => x.Id != command.Id
                     && x.SourceType == effectiveSourceType
                     && x.SourceId == sourceId
                     && !x.IsDeleted,
                cancellationToken);

            if (duplicateSource is not null)
            {
                throw new ConflictException($"A LIB already exists for this {effectiveSourceType} source.");
            }
        }

        // ── LIBNumber uniqueness check only when it is being changed ─────────

        if (request.LIBNumber is not null)
        {
            var existing = await unitOfWork.LineItemBudgetRepository.FindAsync(
                x => x.Id != command.Id && x.LIBNumber == request.LIBNumber,
                cancellationToken);

            if (existing is not null)
                throw new ConflictException($"LIB number '{request.LIBNumber}' already exists.");
        }

        // ── Apply only the fields that were provided ──────────────────────────

        if (request.FiscalYearId.HasValue)        entity.FiscalYearId        = request.FiscalYearId;
        if (request.FundSourceId.HasValue)        entity.FundSourceId        = request.FundSourceId;
        if (request.OfficeId.HasValue)            entity.OfficeId            = request.OfficeId;
        if (request.ParentLIBId.HasValue)         entity.ParentLIBId         = request.ParentLIBId;
        if (request.ConsolidatedIntoLIBId.HasValue) entity.ConsolidatedIntoLIBId = request.ConsolidatedIntoLIBId;
        if (request.SourceId.HasValue)            entity.SourceId            = request.SourceId;
        if (request.LIBNumber  is not null)       entity.LIBNumber           = request.LIBNumber;
        if (request.Name       is not null)       entity.Name                = request.Name;
        if (request.Scope      is not null)       entity.Scope               = request.Scope;
        if (request.Level      is not null)       entity.Level               = request.Level;
        if (request.SourceType is not null)       entity.SourceType          = request.SourceType;

        unitOfWork.LineItemBudgetRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB updated successfully.");
    }
}