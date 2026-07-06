using ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;

public record SubmitPublicApplicationRequest(
    string CompanyName,
    string ContactPerson,
    string EmailAddress,
    string ContactNumber,
    string TinNumber,
    string BusinessAddress,
    List<ApplicationDocumentUploadItem> Documents);