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

        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId!.Value, cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId!.Value, cancellationToken)
            ?? throw new NotFoundException($"Fund Source with ID {request.FundSourceId} not found.");

        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId!.Value, cancellationToken)
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
            throw new ERPEZ.Shared.Exceptions.ValidationException("SourceId is required.");
        }

        var sourceType = request.SourceType;
        // FIXED
        if (sourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase) &&
            !request.Scope.Equals("Activity", StringComparison.OrdinalIgnoreCase))
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("OPCR LIBs must use Activity scope.");
        }

        if (sourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase))
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
            x => x.OfficeId == request.OfficeId && x.FiscalYearId == request.FiscalYearId && !x.IsDeleted,
            cancellationToken);
        if (existing != null)
        {
            throw new ConflictException($"A LIB already exists for this Office and Fiscal Year.");
        }

        var entity = new Domain.Entities.Planning.LineItemBudget
        {
            FiscalYearId = request.FiscalYearId,
            FundSourceId = request.FundSourceId,
            OfficeId = request.OfficeId,
            ParentLIBId = request.ParentLIBId,
            Scope = request.Scope,
            Name = request.Name,
            LIBNumber = $"LIB-{office.Code}-{fiscalYear.Year}",
            Level = request.Level,
            SourceType = sourceType,
            SourceId = request.SourceId,
            Status = "Draft",
            ConsolidatedIntoLIBId = request.ConsolidatedIntoLIBId,
            TotalAmount = request.TotalAmount,
            Version = 1
        };

        await unitOfWork.LineItemBudgetRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "LIB created successfully.");
    }
}

