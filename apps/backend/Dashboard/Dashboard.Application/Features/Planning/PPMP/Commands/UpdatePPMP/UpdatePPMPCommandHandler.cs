using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMP;

public class UpdatePPMPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdatePPMPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePPMPCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("PPMP not found.");

            // Check if PPMP can be edited (must be Draft or Returned status)
            if (ppmp.Status != ERPEZ.Domain.Enums.StatusEnum.Draft && ppmp.Status != ERPEZ.Domain.Enums.StatusEnum.Returned)
                throw new ValidationException($"Cannot update PPMP in {ppmp.Status} status.");

            // Build duplicate check query conditionally for partial updates - check PPMPNumber + FiscalYearId
            if (request.Dto.PPMPNumber != null || request.Dto.FiscalYearId != null)
            {
                var numberToCheck = request.Dto.PPMPNumber ?? ppmp.PPMPNumber;
                var fiscalYearToCheck = request.Dto.FiscalYearId ?? ppmp.FiscalYearId;
                
                var duplicate = await unitOfWork.PPMPRepository.FindAsync(
                    x => x.Id != request.Id && x.PPMPNumber == numberToCheck && x.FiscalYearId == fiscalYearToCheck && x.Version == ppmp.Version,
                    cancellationToken);
                    
                if (duplicate != null)
                    throw new ConflictException("PPMP with the same number and fiscal year already exists.");
            }

            // Validate Office if provided
            if (request.Dto.OfficeId.HasValue)
            {
                _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.Dto.OfficeId.Value, cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"Office with ID {request.Dto.OfficeId.Value} not found.");
            }

            // Validate FiscalYear if provided
            if (request.Dto.FiscalYearId.HasValue)
            {
                _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.Dto.FiscalYearId.Value, cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"Fiscal Year with ID {request.Dto.FiscalYearId.Value} not found.");
            }

            // Validate FundSource if provided
            if (request.Dto.FundSourceId.HasValue)
            {
                _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.Dto.FundSourceId.Value, cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"Fund Source with ID {request.Dto.FundSourceId.Value} not found.");
            }

            // Validate LIB if provided
            if (request.Dto.LIBId.HasValue)
            {
                var targetOfficeId = request.Dto.OfficeId ?? ppmp.OfficeId;
                var targetFiscalYearId = request.Dto.FiscalYearId ?? ppmp.FiscalYearId;
                var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.Dto.LIBId.Value, cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"Line Item Budget with ID {request.Dto.LIBId.Value} not found.");

                if (lib.OfficeId.HasValue && lib.OfficeId.Value != targetOfficeId)
                {
                    throw new ValidationException("The selected Line-Item Budget does not belong to the selected office.");
                }

                if (lib.FiscalYearId.HasValue && lib.FiscalYearId.Value != targetFiscalYearId)
                {
                    throw new ValidationException("The selected Line-Item Budget does not belong to the selected fiscal year.");
                }
            }

            // Update PPMP properties
            ppmp.PPMPNumber = request.Dto.PPMPNumber ?? ppmp.PPMPNumber;
            ppmp.Description = request.Dto.Description ?? ppmp.Description;
            ppmp.OfficeId = request.Dto.OfficeId ?? ppmp.OfficeId;
            ppmp.FiscalYearId = request.Dto.FiscalYearId ?? ppmp.FiscalYearId;
            ppmp.FundSourceId = request.Dto.FundSourceId ?? ppmp.FundSourceId;
            ppmp.LIBId = request.Dto.LIBId ?? ppmp.LIBId;

            unitOfWork.PPMPRepository.Update(ppmp);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP updated successfully.");
    }
}
