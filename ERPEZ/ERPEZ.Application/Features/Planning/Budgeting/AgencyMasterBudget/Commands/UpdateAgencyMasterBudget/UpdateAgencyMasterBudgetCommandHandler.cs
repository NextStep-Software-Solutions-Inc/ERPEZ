using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.UpdateAgencyMasterBudget;

public class UpdateAgencyMasterBudgetCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateAgencyMasterBudgetCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateAgencyMasterBudgetCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var entity = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {request.Id} not found.");

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        var fundCluster = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundClusterId, cancellationToken)
            ?? throw new NotFoundException($"Fund Cluster with ID {request.FundClusterId} not found.");

        if (fundCluster.Type != FundSourceTypeEnum.FundCluster)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Selected Fund Source is not a Fund Cluster.");
        }

        if (!Enum.TryParse<SourceDocumentTypeEnum>(request.SourceDocumentType, true, out var parsedSourceDocumentType))
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("SourceDocumentType must be a valid SourceDocumentTypeEnum value.");
        }

        var sourceDocumentType = parsedSourceDocumentType.ToString();

        var existing = await unitOfWork.AgencyMasterBudgetRepository.FindAsync(
            x => x.Id != request.Id
                && x.FiscalYearId == request.FiscalYearId
                && x.FundClusterId == request.FundClusterId
                && x.SourceDocumentType == sourceDocumentType,
            cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("Agency Master Budget already exists for the selected Fiscal Year, Fund Cluster, and Source Document Type.");
        }

        entity.FiscalYearId = request.FiscalYearId;
        entity.FundClusterId = request.FundClusterId;
        entity.SourceDocumentType = sourceDocumentType;
        entity.PSAmount = request.PSAmount;
        entity.MOOEAmount = request.MOOEAmount;
        entity.COAmount = request.COAmount;

        unitOfWork.AgencyMasterBudgetRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Agency Master Budget updated successfully.");
    }
}

