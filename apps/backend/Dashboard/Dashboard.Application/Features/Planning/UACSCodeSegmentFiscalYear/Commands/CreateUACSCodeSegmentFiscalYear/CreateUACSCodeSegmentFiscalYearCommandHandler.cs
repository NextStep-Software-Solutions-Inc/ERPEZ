using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.CreateUACSCodeSegmentFiscalYear;

/// <summary>
/// Handler for creating a new UACS code segment fiscal year association.
/// </summary>
public class CreateUACSCodeSegmentFiscalYearCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateUACSCodeSegmentFiscalYearCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUACSCodeSegmentFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var codeSegment = await unitOfWork.UACSCodeSegmentRepository.GetByIdAsync(request.UACSCodeSegmentId, cancellationToken)
            ?? throw new NotFoundException("UACS code segment not found.");

        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        var entity = new Domain.Entities.Planning.UACSCodeSegmentFiscalYear
        {
            UACSCodeSegmentId = request.UACSCodeSegmentId,
            FiscalYearId = request.FiscalYearId,
            EffectiveStartDate = request.EffectiveStartDate,
            EffectiveEndDate = request.EffectiveEndDate,
            IsActive = request.IsActive
        };

        await unitOfWork.UACSCodeSegmentFiscalYearRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "UACS code segment fiscal year association created successfully.");
    }
}
