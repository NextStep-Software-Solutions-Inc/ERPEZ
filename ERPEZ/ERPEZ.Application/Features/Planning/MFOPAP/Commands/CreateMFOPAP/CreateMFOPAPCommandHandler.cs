using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.CreateMFOPAP;

public class CreateMFOPAPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateMFOPAPCommand, ApiResponse<Domain.Entities.Planning.MFOPAP>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.MFOPAP>> Handle(CreateMFOPAPCommand request, CancellationToken cancellationToken)
    {
        var mfoPAPExist = await unitOfWork.MFOPAPRepository.FindAsync(t => t.Name == request.Name && t.Code == request.Code, cancellationToken: cancellationToken);
        if (mfoPAPExist != null) throw new ConflictException("MFOPAP already exists.");
        var mfoPAP = new Domain.Entities.Planning.MFOPAP
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive
        };
        await unitOfWork.MFOPAPRepository.AddAsync(mfoPAP, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Domain.Entities.Planning.MFOPAP>.Success(mfoPAP, "MFOPAP created successfully.");
    }
}
