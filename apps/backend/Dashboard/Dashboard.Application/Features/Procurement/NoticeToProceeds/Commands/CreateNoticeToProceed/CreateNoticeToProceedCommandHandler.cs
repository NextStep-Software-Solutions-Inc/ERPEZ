using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CreateNoticeToProceed;

public class CreateNoticeToProceedCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<CreateNoticeToProceedCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateNoticeToProceedCommand request, CancellationToken cancellationToken)
    {
        var contract = await unitOfWork.ContractRepository.GetByIdAsync(request.ContractId, cancellationToken);
        if (contract == null || contract.IsDeleted)
        {
            return ApiResponse<Guid>.Fail("Contract not found.");
        }

        // Eligibility check: Contract must be in Approved or Executed status
        if (contract.Status != ContractStatus.Approved && contract.Status != ContractStatus.Executed)
        {
            return ApiResponse<Guid>.Fail($"Contract is in status '{contract.Status}'. Notice to Proceed can only be created for Approved or Executed Contracts.");
        }

        // Cardinality check: 1 active NTP per Contract
        var hasActiveNtp = await unitOfWork.NoticeToProceedRepository.ExistsActiveForContractAsync(request.ContractId, cancellationToken);
        if (hasActiveNtp)
        {
            return ApiResponse<Guid>.Fail("An active Notice to Proceed already exists for this Contract.");
        }

        string ntpNumber;
        if (!string.IsNullOrWhiteSpace(request.NTPNumber))
        {
            ntpNumber = request.NTPNumber.Trim();
            var existingWithNumber = await unitOfWork.NoticeToProceedRepository.FindAsync(
                n => n.NTPNumber == ntpNumber && n.Status != NoticeToProceedStatus.Cancelled && !n.IsDeleted,
                cancellationToken
            );
            if (existingWithNumber != null)
            {
                return ApiResponse<Guid>.Fail($"Notice to Proceed number '{ntpNumber}' is already in use.");
            }
        }
        else
        {
            var currentYear = DateTime.UtcNow.Year;
            var startOfYear = new DateTime(currentYear, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var endOfYear = new DateTime(currentYear + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var yearNtps = await unitOfWork.NoticeToProceedRepository.ToListAsync(
                unitOfWork.NoticeToProceedRepository.Query(n => n.CreatedAt >= startOfYear && n.CreatedAt < endOfYear),
                cancellationToken
            );
            ntpNumber = $"NTP-{currentYear}-{(yearNtps.Count + 1):D3}";
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        var ntpDate = request.NTPDate != default ? request.NTPDate : DateOnly.FromDateTime(DateTime.UtcNow);
        var commencementDate = request.CommencementDate;
        var deliveryDeadline = request.DeliveryCompletionDeadline;

        if (commencementDate.HasValue && request.ImplementationPeriodDays.HasValue && !deliveryDeadline.HasValue)
        {
            deliveryDeadline = commencementDate.Value.AddDays(request.ImplementationPeriodDays.Value);
        }

        var ntp = new NoticeToProceed
        {
            Id = Guid.NewGuid(),
            NTPNumber = ntpNumber,
            ContractId = contract.Id,
            NTPDate = ntpDate,
            EffectivityDate = request.EffectivityDate,
            CommencementDate = commencementDate,
            ImplementationPeriodDays = request.ImplementationPeriodDays,
            DeliveryCompletionDeadline = deliveryDeadline,
            PlaceOfDelivery = request.PlaceOfDelivery?.Trim(),
            Description = request.Description?.Trim(),
            Status = NoticeToProceedStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = actorName,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = actorName
        };

        await unitOfWork.NoticeToProceedRepository.AddAsync(ntp, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(ntp.Id, "Notice to Proceed draft created successfully.");
    }
}
