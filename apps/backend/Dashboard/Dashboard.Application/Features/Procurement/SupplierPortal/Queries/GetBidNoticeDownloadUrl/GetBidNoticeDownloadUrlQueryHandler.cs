using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetBidNoticeDownloadUrl;

public class GetBidNoticeDownloadUrlQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetBidNoticeDownloadUrlQuery, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(
        GetBidNoticeDownloadUrlQuery request, CancellationToken cancellationToken)
    {
        var checklistItem = await unitOfWork.ProjectDocumentChecklistRepository
            .GetByIdWithMasterTypeAsync(request.ChecklistItemId, request.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Bid notice not found.");

        var fileUrl = checklistItem.CustomTemplateFileUrl ?? checklistItem.MasterDocumentType?.TemplateFileUrl;

        if (string.IsNullOrWhiteSpace(fileUrl))
            throw new NotFoundException("No downloadable file is attached to this bid notice.");

        return ApiResponse<string>.Success(fileUrl);
    }
}