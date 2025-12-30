using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.UpdateMFOPAP;

public sealed class UpdateMFOPAPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateMFOPAPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateMFOPAPCommand request, CancellationToken cancellationToken)
    {
        var mfoPAP = await unitOfWork.MFOPAPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("MFOPAP not found.");

        var dto = request.UpdateMFOPAP;
        if (mfoPAP.Name == dto.Name && mfoPAP.Code == dto.Code) throw new ConflictException("MFOPAP already exist.");

        mfoPAP.ParentId = dto?.ParentId ?? mfoPAP.ParentId;
        mfoPAP.Name = dto?.Name ?? mfoPAP.Name;
        mfoPAP.Code = dto?.Code ?? mfoPAP.Code;
        mfoPAP.Type = dto?.Type ?? mfoPAP.Type;
        mfoPAP.IsActive = dto?.IsActive ?? mfoPAP.IsActive;


        unitOfWork.MFOPAPRepository.Update(mfoPAP);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "MFOPAP updated successfully.");
    }
}
