using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;

public record SubmitPublicApplicationCommand(
    Guid   ProjectId,
    string CompanyName,
    string ContactPerson,
    string EmailAddress,
    string ContactNumber,
    string TinNumber,
    string BusinessAddress,
    List<ApplicationDocumentUploadItem> Documents,
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
) : IRequest<ApiResponse<Guid>>;

public record ApplicationDocumentUploadItem(Guid ChecklistItemId, Guid FileId);

public record PublicItemBidDto(
    Guid RFQItemId,
    decimal UnitPrice,
    string? Brand = null,
    string? Model = null,
    string? Color = null,
    Guid? BrochureFileId = null
);
