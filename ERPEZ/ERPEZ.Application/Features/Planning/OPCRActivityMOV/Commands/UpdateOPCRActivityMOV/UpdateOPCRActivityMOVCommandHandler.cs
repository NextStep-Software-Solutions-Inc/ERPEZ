using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.UpdateOPCRActivityMOV;

public class UpdateOPCRActivityMOVCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRActivityMOVCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRActivityMOVCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateMOV;

        var mov = await unitOfWork.OPCRActivityMOVRepository.GetByIdWithDetailsAsync(
            request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity MOV not found.");

        // Update only provided fields
        if (!string.IsNullOrWhiteSpace(dto.FileName))
            mov.FileName = dto.FileName;

        if (dto.Url is not null)
            mov.Url = dto.Url;

        if (dto.UploadedDate.HasValue)
            mov.UploadedDate = dto.UploadedDate;

        unitOfWork.OPCRActivityMOVRepository.Update(mov);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Activity MOV updated successfully.");
    }
}
