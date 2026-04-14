using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.CreateAgencyMasterBudget;

public class CreateAgencyMasterBudgetCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateAgencyMasterBudgetCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAgencyMasterBudgetCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

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
            x => x.FiscalYearId == request.FiscalYearId
                && x.FundClusterId == request.FundClusterId
                && x.SourceDocumentType == sourceDocumentType,
            cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("Agency Master Budget already exists for the selected Fiscal Year, Fund Cluster, and Source Document Type.");
        }

        var entity = new Domain.Entities.Planning.AgencyMasterBudget
        {
            FiscalYearId = request.FiscalYearId,
            FundClusterId = request.FundClusterId,
            SourceDocumentType = sourceDocumentType,
            PSAmount = request.PSAmount,
            MOOEAmount = request.MOOEAmount,
            COAmount = request.COAmount
        };

        await unitOfWork.AgencyMasterBudgetRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Agency Master Budget created successfully.");
    }
}

