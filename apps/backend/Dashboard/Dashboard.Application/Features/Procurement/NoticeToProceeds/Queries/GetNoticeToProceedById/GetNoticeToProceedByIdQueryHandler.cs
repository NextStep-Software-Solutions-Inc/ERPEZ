using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Utils;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedById;

public class GetNoticeToProceedByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetNoticeToProceedByIdQuery, ApiResponse<NoticeToProceedDetailDto>>
{
    public async Task<ApiResponse<NoticeToProceedDetailDto>> Handle(GetNoticeToProceedByIdQuery request, CancellationToken cancellationToken)
    {
        var ntp = await unitOfWork.NoticeToProceedRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (ntp == null || ntp.IsDeleted)
        {
            return ApiResponse<NoticeToProceedDetailDto>.Fail("Notice to Proceed not found.");
        }

        var contract = ntp.Contract;
        var noa = contract?.NoticeOfAward;
        var supplier = noa?.Supplier;
        var project = noa != null
            ? await unitOfWork.ProcurementProjectRepository.GetWithAwardDetailsByIdAsync(noa.ProcurementProjectId, cancellationToken)
            : null;

        var lineItems = noa != null
            ? await ContractLineItemResolver.ResolveLineItemsAsync(unitOfWork, project, noa, cancellationToken)
            : [];

        var contractNumber = !string.IsNullOrWhiteSpace(ntp.ContractNumberSnapshot)
            ? ntp.ContractNumberSnapshot
            : (contract?.ContractNumber ?? string.Empty);

        var supplierName = !string.IsNullOrWhiteSpace(ntp.SupplierNameSnapshot)
            ? ntp.SupplierNameSnapshot
            : (supplier?.Name ?? string.Empty);

        var supplierAddress = !string.IsNullOrWhiteSpace(ntp.SupplierAddressSnapshot)
            ? ntp.SupplierAddressSnapshot
            : (supplier?.Address ?? string.Empty);

        var projectTitle = !string.IsNullOrWhiteSpace(ntp.ProjectTitleSnapshot)
            ? ntp.ProjectTitleSnapshot
            : (project?.Title ?? noa?.Description ?? contract?.Description ?? string.Empty);

        var totalAmount = (ntp.Status == NoticeToProceedStatus.Issued || ntp.Status == NoticeToProceedStatus.Received) && ntp.AwardedAmountSnapshot > 0
            ? ntp.AwardedAmountSnapshot
            : (noa?.AwardedAmount ?? 0m);

        var dto = new NoticeToProceedDetailDto
        {
            Id = ntp.Id,
            NTPNumber = ntp.NTPNumber,
            ContractId = ntp.ContractId,
            NTPDate = ntp.NTPDate,
            EffectivityDate = ntp.EffectivityDate,
            CommencementDate = ntp.CommencementDate,
            ImplementationPeriodDays = ntp.ImplementationPeriodDays,
            DeliveryCompletionDeadline = ntp.DeliveryCompletionDeadline,
            PlaceOfDelivery = ntp.PlaceOfDelivery,
            Description = ntp.Description,
            Status = ntp.Status,

            ContractNumber = contractNumber,
            ContractDate = contract?.ContractDate ?? default,
            ContractApprovedAt = contract?.ContractApprovedAt,
            ContractDescription = contract?.Description ?? string.Empty,

            NoticeOfAwardId = noa?.Id ?? Guid.Empty,
            NOANumber = noa?.NOANumber ?? string.Empty,
            NOADate = noa?.NOADate ?? default,

            SupplierId = supplier?.Id ?? noa?.SupplierId ?? Guid.Empty,
            SupplierName = supplierName,
            SupplierAddress = supplierAddress,
            SupplierContactPerson = supplier?.ContactPerson,
            SupplierEmail = supplier?.Email,
            SupplierContactNumber = supplier?.ContactNumber,

            ProcurementProjectId = project?.Id ?? noa?.ProcurementProjectId ?? Guid.Empty,
            ProjectTitle = projectTitle,
            TotalAmount = totalAmount,
            ModeOfProcurement = project?.ProcurementMode?.Name ?? "Competitive Public Bidding",
            BACResolutionNumber = noa?.BACResolution?.ResolutionNumber,

            ContractNumberSnapshot = ntp.ContractNumberSnapshot,
            ContractApprovedDateSnapshot = ntp.ContractApprovedDateSnapshot,
            AwardedAmountSnapshot = ntp.AwardedAmountSnapshot > 0 ? ntp.AwardedAmountSnapshot : null,
            SupplierNameSnapshot = ntp.SupplierNameSnapshot,
            SupplierAddressSnapshot = ntp.SupplierAddressSnapshot,
            ProjectTitleSnapshot = ntp.ProjectTitleSnapshot,

            LineItems = lineItems,

            IssuedById = ntp.IssuedById,
            IssuedByName = ntp.IssuedByName,
            IssuedAt = ntp.IssuedAt,
            ReceivedAt = ntp.ReceivedAt,
            ReceivedByName = ntp.ReceivedByName,
            SignedDocumentFileId = ntp.SignedDocumentFileId,
            SignedDocumentFileName = ntp.SignedDocumentFileName,

            PhilGEPSPostedAt = ntp.PhilGEPSPostedAt,
            PhilGEPSReferenceNumber = ntp.PhilGEPSReferenceNumber,

            CancellationReason = ntp.CancellationReason,
            CancelledById = ntp.CancelledById,
            CancelledAt = ntp.CancelledAt,

            CreatedAt = ntp.CreatedAt,
            CreatedBy = ntp.CreatedBy,
            UpdatedAt = ntp.UpdatedAt,
            UpdatedBy = ntp.UpdatedBy
        };

        return ApiResponse<NoticeToProceedDetailDto>.Success(dto);
    }
}
