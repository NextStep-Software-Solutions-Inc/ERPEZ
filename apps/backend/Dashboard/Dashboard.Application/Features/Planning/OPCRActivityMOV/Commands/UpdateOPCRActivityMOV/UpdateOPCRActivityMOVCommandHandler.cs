using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.UpdateOPCRActivityMOV;

public class UpdateOPCRActivityMOVCommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
    : IRequestHandler<UpdateOPCRActivityMOVCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRActivityMOVCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateMOV;

        var mov = await unitOfWork.OPCRActivityMOVRepository.GetByIdWithDetailsAsync(
            request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity MOV not found.");

        // Update file if FileId is provided
        if (dto.FileId.HasValue)
        {
            var (url, _) = await fileStorageService.PromoteFileAsync(dto.FileId.Value, cancellationToken);

            // Extract filename from the URL (blob name format: {fileId}_{filename})
            var blobName = url.Split('/').Last();
            var fileName = blobName.Contains('_') ? blobName[(blobName.IndexOf('_') + 1)..] : blobName;

            mov.FileName = fileName;
            mov.Url = url;
            mov.UploadedDate = DateTime.UtcNow;
        }

        unitOfWork.OPCRActivityMOVRepository.Update(mov);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Activity MOV updated successfully.");
    }
}
