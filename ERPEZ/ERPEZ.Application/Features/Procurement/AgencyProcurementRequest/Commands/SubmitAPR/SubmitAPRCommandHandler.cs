using ERPEZ.Application.Common.Exceptions;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.SubmitAPR;

public class SubmitAPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SubmitAPRCommand, ApiResponse<string>>
{
    private const int maxNumberGenerationRetries = 1;

    public async Task<ApiResponse<string>> Handle(SubmitAPRCommand request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.Id, cancellationToken);
        if (apr is null)
            return ApiResponse<string>.Fail("APR not found.");

        if (apr.Status != StatusEnum.Draft)
            return ApiResponse<string>.Fail(
                $"Only APRs in Draft status can be submitted for approval. Current status: {apr.Status}.");

        if (apr.APRItems.Count == 0)
            return ApiResponse<string>.Fail("Cannot submit an APR with no line items.");

        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(apr.FiscalYearId, cancellationToken);
        if (fiscalYear is null)
            return ApiResponse<string>.Fail("Fiscal year not found.");

        apr.Status = StatusEnum.ForApproval;
        apr.SubmittedDate = DateTime.UtcNow;

        for (var attempt = 0; ; attempt++)
        {
            var submittedCount = await unitOfWork.APRRepository.CountSubmittedForFiscalYearAsync(
                apr.FiscalYearId, cancellationToken);
            apr.APRNumber = $"APR-{fiscalYear.Year}-{(submittedCount + 1).ToString("D3")}";

            try
            {
                await unitOfWork.SaveChangesAsync(cancellationToken);
                return ApiResponse<string>.Success(apr.APRNumber, "APR submitted for approval.");
            }
            catch (ConcurrencyConflictException) when (attempt < maxNumberGenerationRetries)
            {
                // retry
            }
        }
    }
}
