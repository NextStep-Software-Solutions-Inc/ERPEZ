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

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId!.Value, cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId!.Value, cancellationToken)
            ?? throw new NotFoundException($"Fund Cluster with ID {request.FundSourceId} not found.");

        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId!.Value, cancellationToken)
            ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

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

        if (!request.SourceId.HasValue)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("SourceId is required for LIB source types OPCR and WFP.");
        }

        if (request.SourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase))
        {
            _ = await unitOfWork.OPCRRepository.GetByIdAsync(request.SourceId.Value, cancellationToken)
                ?? throw new NotFoundException($"OPCR source with ID {request.SourceId} not found.");
        }
        else
        {
            _ = await unitOfWork.WFPRepository.GetByIdAsync(request.SourceId.Value, cancellationToken)
                ?? throw new NotFoundException($"WFP source with ID {request.SourceId} not found.");
        }

        var existing = await unitOfWork.LineItemBudgetRepository.FindAsync(
            x => x.Id != command.Id && x.LIBNumber == request.LIBNumber,
            cancellationToken);
        if (existing != null)
        {
            throw new ConflictException($"LIB number '{request.LIBNumber}' already exists.");
        }

        entity.FiscalYearId = request.FiscalYearId;
        entity.FundClusterId = request.FundSourceId;
        entity.OfficeId = request.OfficeId;
        entity.ParentLIBId = request.ParentLIBId;
        entity.Scope = request.Scope;
        entity.Name = request.Name;
        entity.LIBNumber = request.LIBNumber;
        entity.Level = string.Empty;
        entity.SourceType = request.SourceType;
        entity.SourceId = request.SourceId;
        entity.ConsolidatedIntoLIBId = request.ConsolidatedIntoLIBId;
        entity.TotalAmount = request.TotalAmount;

        unitOfWork.LineItemBudgetRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB updated successfully.");
    }
}

