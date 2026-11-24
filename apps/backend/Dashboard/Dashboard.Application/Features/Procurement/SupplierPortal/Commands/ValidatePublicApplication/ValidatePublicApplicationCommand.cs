using ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.ValidatePublicApplication;

public record ValidatePublicApplicationCommand(
    Guid ProjectId,
    string CompanyName,
    string ContactPerson,
    string EmailAddress,
    string ContactNumber,
    string TinNumber,
    string BusinessAddress,
    List<Guid> ChecklistItemIds,
    decimal? ProposedBidAmount = null,
    string? DeliveryPeriod = null,
    string? PaymentTerms = null,
    string? WarrantyTerms = null,
    int? ValidityPeriodDays = null,
    string? Remarks = null,
    string? BidSecurityType = null,
    decimal? BidSecurityAmount = null,
    string? BidSecurityNumber = null,
    int? BidSecurityValidityDays = null,
    List<PublicItemBidDto>? ItemBids = null
) : IRequest<ApiResponse<bool>>;
