using ERPEZ.Application.Common.Exceptions;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.SubmitAPR;

public class SubmitAPRCommandHandler : IRequestHandler<SubmitAPRCommand, string>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly ICurrentUserService currentUser;

    private const int maxNumberGenerationRetries = 1;

    public SubmitAPRCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        this.unitOfWork = unitOfWork;
        this.currentUser = currentUser;
    }

    public async Task<string> Handle(SubmitAPRCommand request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new InvalidOperationException("APR not found.");

        if (apr.Status != StatusEnum.Draft)
            throw new InvalidOperationException(
                $"Only APRs in Draft status can be submitted for approval. Current status: {apr.Status}.");

        if (apr.APRItems.Count == 0)
            throw new InvalidOperationException("Cannot submit an APR with no line items.");

        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(apr.FiscalYearId, cancellationToken)
            ?? throw new InvalidOperationException("Fiscal year not found.");

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
                return apr.APRNumber;
            }
            catch (ConcurrencyConflictException) when (attempt < maxNumberGenerationRetries)
            {
                // loop recomputes submittedCount and retries once
            }
        }
    }
}
