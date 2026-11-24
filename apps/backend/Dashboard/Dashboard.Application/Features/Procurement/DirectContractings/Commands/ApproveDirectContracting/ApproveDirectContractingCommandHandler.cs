using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ApproveDirectContracting;

public class ApproveDirectContractingCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<ApproveDirectContractingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApproveDirectContractingCommand request, CancellationToken cancellationToken)
    {
        var dc = await unitOfWork.DirectContractingRepository.Query()
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (dc == null)
            return ApiResponse<Unit>.Fail("Direct Contracting not found.");

        if (dc.Status == DirectContractingStatusEnum.APPROVED)
            return ApiResponse<Unit>.Fail("Direct Contracting is already approved.");

        // Promote the temp file to permanent storage
        try
        {
            await fileStorageService.PromoteFileAsync(request.Request.AttachmentFileId);
        }
        catch (Exception ex)
        {
            return ApiResponse<Unit>.Fail($"Failed to attach file: {ex.Message}");
        }

        // Update Direct Contracting
        dc.Status = DirectContractingStatusEnum.APPROVED;
        dc.ApprovedFileId = request.Request.AttachmentFileId;

        unitOfWork.DirectContractingRepository.Update(dc);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Direct Contracting approved successfully.");
    }
}
