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
    List<ApplicationDocumentUploadItem> Documents
) : IRequest<ApiResponse<Guid>>;

public record ApplicationDocumentUploadItem(Guid ChecklistItemId, Guid FileId);