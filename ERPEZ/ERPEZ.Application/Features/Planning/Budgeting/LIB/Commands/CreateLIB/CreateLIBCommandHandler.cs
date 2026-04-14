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

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId!.Value, cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundClusterId!.Value, cancellationToken)
            ?? throw new NotFoundException($"Fund Cluster with ID {request.FundClusterId} not found.");

        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId!.Value, cancellationToken)
            ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

        _ = await unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.DeliveryUnitId, cancellationToken)
            ?? throw new NotFoundException($"Delivery Unit with ID {request.DeliveryUnitId} not found.");

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

        if (request.PreviousVersionId.HasValue)
        {
            _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.PreviousVersionId.Value, cancellationToken)
                ?? throw new NotFoundException($"Previous Version LIB with ID {request.PreviousVersionId} not found.");
        }

        if (!request.SourceId.HasValue)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("SourceId is required for LIB source types OPCR and WFP.");
        }

        var sourceType = request.SourceType.ToString();
        if (request.SourceType == Common.Enums.LIBSourceTypeEnum.OPCR)
        {
            _ = await unitOfWork.OPCRRepository.GetByIdAsync(request.SourceId.Value, cancellationToken)
                ?? throw new NotFoundException($"OPCR source with ID {request.SourceId} not found.");
        }
        else
        {
            _ = await unitOfWork.WFPRepository.GetByIdAsync(request.SourceId.Value, cancellationToken)
                ?? throw new NotFoundException($"WFP source with ID {request.SourceId} not found.");
        }

        var existing = await unitOfWork.LineItemBudgetRepository.FindAsync(x => x.LIBNumber == request.LIBNumber, cancellationToken);
        if (existing != null)
        {
            throw new ConflictException($"LIB number '{request.LIBNumber}' already exists.");
        }

        var entity = new Domain.Entities.Planning.LineItemBudget
        {
            FiscalYearId = request.FiscalYearId,
            FundClusterId = request.FundClusterId,
            OfficeId = request.OfficeId,
            ParentLIBId = request.ParentLIBId,
            DeliveryUnitId = request.DeliveryUnitId,
            Scope = request.Scope,
            Name = request.Name,
            LIBNumber = request.LIBNumber,
            Level = request.Level.ToString(),
            SourceType = sourceType,
            SourceId = request.SourceId,
            Status = request.Status.ToString(),
            ConsolidatedIntoLIBId = request.ConsolidatedIntoLIBId,
            TotalAmount = request.TotalAmount,
            Version = request.Version,
            PreviousVersionId = request.PreviousVersionId
        };

        await unitOfWork.LineItemBudgetRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "LIB created successfully.");
    }
}

