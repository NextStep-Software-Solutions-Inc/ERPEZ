using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIB;

public class UpdateLIBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateLIBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateLIBCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var entity = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {command.Id} not found.");

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

        if (request.ParentLIBId.HasValue)
        {
            if (await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.ParentLIBId.Value, cancellationToken) is null)
                throw new NotFoundException($"Parent LIB with ID {request.ParentLIBId} not found.");
        }

        if (request.ConsolidatedIntoLIBId.HasValue)
        {
            if (await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.ConsolidatedIntoLIBId.Value, cancellationToken) is null)
                throw new NotFoundException($"Consolidated-Into LIB with ID {request.ConsolidatedIntoLIBId} not found.");
        }

        // ── SourceType + SourceId: validate together only when either is provided

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
        if (request.TotalAmount.HasValue)         entity.TotalAmount         = request.TotalAmount;
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