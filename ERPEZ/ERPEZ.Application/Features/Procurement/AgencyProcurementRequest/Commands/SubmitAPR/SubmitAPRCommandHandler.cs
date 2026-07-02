using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using MediatR;

namespace ERPEZ.Application.Planning.APRs.Commands.SubmitAPR;

public class SubmitAPRCommandHandler : IRequestHandler<SubmitAPRCommand, string>
{
    private readonly IAPRRepository aprRepository;
    private readonly IFiscalYearRepository fiscalYearRepository;
    private readonly IUnitOfWork unitOfWork;
    private readonly ICurrentUserService currentUser;

    public SubmitAPRCommandHandler(
        IAPRRepository aprRepository,
        IFiscalYearRepository fiscalYearRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        this.aprRepository = aprRepository;
        this.fiscalYearRepository = fiscalYearRepository;
        this.unitOfWork = unitOfWork;
        this.currentUser = currentUser;
    }

    public async Task<string> Handle(SubmitAPRCommand request, CancellationToken cancellationToken)
    {
        // 1. Load APR and validate it's currently a Draft (Image 2: Draft -> For Approval)
        var apr = await aprRepository.GetAPRWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new InvalidOperationException("APR not found.");

        if (apr.Status != StatusEnum.Draft)
            throw new InvalidOperationException(
                $"Only APRs in Draft status can be submitted for approval. Current status: {apr.Status}.");

        if (apr.APRItems.Count == 0)
            throw new InvalidOperationException("Cannot submit an APR with no line items.");

        // 2. Renumber: office-scoped draft sequence -> flat FY sequence
        //    (APR-2026-DRAFT-MED-001 -> APR-2026-002, Image 1)
        var fiscalYear = await fiscalYearRepository.GetByIdAsync(apr.FiscalYearId, cancellationToken)
            ?? throw new InvalidOperationException("Fiscal year not found.");

        var submittedCount = await aprRepository.CountSubmittedForFiscalYearAsync(
            apr.FiscalYearId, cancellationToken);

        var seq = (submittedCount + 1).ToString("D3");
        apr.APRNumber = $"APR-{fiscalYear.Year}-{seq}";

        // 3. Flip status and stamp submission date
        apr.Status = StatusEnum.ForApproval;
        apr.SubmittedDate = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return apr.APRNumber;
    }
}
