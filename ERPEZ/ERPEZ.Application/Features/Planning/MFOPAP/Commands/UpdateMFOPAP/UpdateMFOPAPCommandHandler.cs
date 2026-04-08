using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.UpdateMFOPAP;

public sealed class UpdateMFOPAPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateMFOPAPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateMFOPAPCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateMFOPAP;

        if (dto.FiscalYearId.HasValue)
        {
            _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(dto.FiscalYearId.Value, cancellationToken) ?? throw new NotFoundException($"Fiscal Year with the specified ID ({dto.FiscalYearId.Value}) does not exist.");
        }

        var mfoPAP = await unitOfWork.MFOPAPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("MFOPAP not found.");

        // Check for duplicate name and code (excluding current MFOPAP)
        if (dto.Name != null && dto.Code != null)
        {
            var existingMFOPAP = await unitOfWork.MFOPAPRepository.FindAsync(m => m.Name == dto.Name && m.Code == dto.Code && m.Id != request.Id && m.FiscalYearId == dto.FiscalYearId,
                cancellationToken);
            if (existingMFOPAP != null)
                throw new ConflictException("MFOPAP already exist.");
        }

        mfoPAP.ParentId = dto?.ParentId ?? mfoPAP.ParentId;
        mfoPAP.Name = dto?.Name ?? mfoPAP.Name;
        mfoPAP.Code = dto?.Code ?? mfoPAP.Code;
        mfoPAP.Type = dto?.Type ?? mfoPAP.Type;
        mfoPAP.IsActive = dto?.IsActive ?? mfoPAP.IsActive;
        mfoPAP.FiscalYearId = dto?.FiscalYearId ?? mfoPAP.FiscalYearId;


        unitOfWork.MFOPAPRepository.Update(mfoPAP);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "MFOPAP updated successfully.");
    }
}
