using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ApproveDirectAcquisition;

public class ApproveDirectAcquisitionCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    ICurrentUserService currentUserService)
    : IRequestHandler<ApproveDirectAcquisitionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApproveDirectAcquisitionCommand command, CancellationToken cancellationToken)
    {
        var da = await unitOfWork.DirectAcquisitionRepository.GetByIdAsync(command.DirectAcquisitionId, cancellationToken);
        if (da == null)
        {
            return ApiResponse<Unit>.Fail("Direct Acquisition record not found.");
        }

        var req = command.Request;

        if (req.ApprovedFileId.HasValue && req.ApprovedFileId.Value != Guid.Empty)
        {
            string blobUrl = string.Empty;
            string fileName = req.ApprovedFileName ?? "signed-approval.pdf";

            try
            {
                var (promotedUrl, originalName) = await fileStorageService.PromoteFileAsync(req.ApprovedFileId.Value, cancellationToken);
                blobUrl = promotedUrl;
                if (!string.IsNullOrEmpty(originalName))
                {
                    fileName = originalName;
                }
            }
            catch
            {
                // Fallback to storing metadata
            }

            var doc = new DirectAcquisitionDocument
            {
                DirectAcquisitionId = da.Id,
                FileId = req.ApprovedFileId.Value,
                FileName = fileName,
                FileType = req.ApprovedFileType ?? "pdf",
                BlobUrl = blobUrl,
                DocumentType = "SIGNED_APPROVAL",
                UploadedAt = DateTime.UtcNow
            };

            await unitOfWork.DirectAcquisitionDocumentRepository.AddAsync(doc, cancellationToken);
            da.ApprovedFileId = req.ApprovedFileId.Value;
        }

        if (Guid.TryParse(currentUserService.UserId, out var reviewerId))
        {
            da.ReviewedByUserId = reviewerId;
        }

        da.Status = DirectAcquisitionStatusEnum.APPROVED;
        unitOfWork.DirectAcquisitionRepository.Update(da);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Direct Acquisition approved successfully.");
    }
}
