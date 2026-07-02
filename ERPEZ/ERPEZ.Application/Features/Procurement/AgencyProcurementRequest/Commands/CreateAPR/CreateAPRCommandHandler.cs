using ERPEZ.Application.Common.Exceptions;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using MediatR;

namespace ERPEZ.Application.Planning.APRs.Commands.CreateAPR;

public class CreateAPRCommandHandler : IRequestHandler<CreateAPRCommand, Guid>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly ICurrentUserService currentUser;

    private const int maxNumberGenerationRetries = 1;

    public CreateAPRCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        this.unitOfWork = unitOfWork;
        this.currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateAPRCommand request, CancellationToken cancellationToken)
    {
        // 1. Load the source APP with full details and validate it's approved
        var app = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(request.APPId, cancellationToken)
            ?? throw new InvalidOperationException("Selected APP not found. Please select a valid APP.");

        if (app.Status != StatusEnum.Approved)
            throw new InvalidOperationException("Selected APP is not approved.");

        var allAppItemsForApp = app.APPItems;
        var appItemIds = request.Items.Select(i => i.APPItemId).ToList();
        var selectedAppItems = allAppItemsForApp.Where(ai => appItemIds.Contains(ai.Id)).ToList();

        if (selectedAppItems.Count != appItemIds.Count)
            throw new InvalidOperationException("One or more selected line items do not belong to the selected APP.");

        static (decimal qty, decimal amount) GetTotals(APPItem appItem)
        {
            var allocations = appItem.PPMPItem?.PPMPItemAllocations ?? [];
            if (allocations.Count == 0)
                return (0, 0);

            return (allocations.Sum(a => (decimal)a.Quantity), allocations.Sum(a => a.Amount));
        }

        // 2. Compute APP's approved budget on the fly
        var appApprovedBudget = allAppItemsForApp.Sum(ai => GetTotals(ai).amount);

        // 3. Generate APRNumber — draft-prefixed & office-scoped
        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
            ?? throw new InvalidOperationException("Office not found.");

        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new InvalidOperationException("Fiscal year not found.");

        var draftCount = await unitOfWork.APRRepository.CountDraftsForOfficeAsync(
            request.FiscalYearId, request.OfficeId, cancellationToken);

        var aprNumber = $"APR-{fiscalYear.Year}-DRAFT-{office.Code}-{(draftCount + 1).ToString("D3")}";

        // 4. Build APR + APRItems
        var apr = new APR
        {
            APRNumber = aprNumber,
            APPId = request.APPId,
            OfficeId = request.OfficeId,
            FiscalYearId = request.FiscalYearId,
            AgencyControlNumber = request.AgencyControlNumber,
            AgencyAccountCode = request.AgencyAccountCode,
            RequestDate = request.RequestDate,
            Description = request.Description,
            ModeOfDelivery = request.ModeOfDelivery,
            InsufficientFundsAction = request.InsufficientFundsAction,
            RequiresObR = request.RequiresObR,
            RequiresCBA = request.RequiresCBA,
            RequiresCompleteSpecifications = request.RequiresCompleteSpecifications,
            AdditionalRemarks = request.AdditionalRemarks,
            Status = StatusEnum.Draft
        };

        decimal totalAmount = 0;

        foreach (var dto in request.Items)
        {
            var appItem = selectedAppItems.First(ai => ai.Id == dto.APPItemId);

            if (appItem.PPMPItem is null)
                throw new InvalidOperationException($"Source PPMP item not found for APP item {appItem.Id}.");

            var (allocatedQty, _) = GetTotals(appItem);
            var qty = dto.QuantityRequested ?? allocatedQty;
            var unitCost = dto.UnitCost ?? appItem.PPMPItem.UnitPrice;

            if (qty <= 0)
                throw new InvalidOperationException(
                    $"No quantity found for line item {appItem.Id}. PPMPItem has no allocations and no override was supplied.");

            var totalCost = unitCost * qty;
            totalAmount += totalCost;

            apr.APRItems.Add(new APRItem
            {
                APPItemId = appItem.Id,
                PPMPItemId = appItem.PPMPItemId,
                QuantityRequested = qty,
                UnitCost = unitCost,
                TotalCost = totalCost
            });
        }

        apr.TotalAmount = totalAmount;

        // 5. Budget ceiling validation
        if (totalAmount > appApprovedBudget)
        {
            throw new InvalidOperationException(
                $"APR budget (₱{totalAmount:N0}) exceeds APP approved budget (₱{appApprovedBudget:N0}).");
        }

        // 6. Save with a single retry on APRNumber collision (safety net behind the unique index;
        //    system is single-instance so a second collision is not expected in practice).
        for (var attempt = 0; ; attempt++)
        {
            try
            {
                await unitOfWork.APRRepository.AddAsync(apr);
                await unitOfWork.SaveChangesAsync(cancellationToken);
                return apr.Id;
            }
            catch (ConcurrencyConflictException) when (attempt < maxNumberGenerationRetries)
            {
                var retryDraftCount = await unitOfWork.APRRepository.CountDraftsForOfficeAsync(
                    apr.FiscalYearId, apr.OfficeId, cancellationToken);

                apr.APRNumber = $"APR-{fiscalYear.Year}-DRAFT-{office.Code}-{(retryDraftCount + 1).ToString("D3")}";
            }
        }
    }
}
