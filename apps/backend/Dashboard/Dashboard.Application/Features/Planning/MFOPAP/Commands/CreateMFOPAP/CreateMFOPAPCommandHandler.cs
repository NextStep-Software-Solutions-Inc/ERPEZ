using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.CreateMFOPAP;

public class CreateMFOPAPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateMFOPAPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateMFOPAPCommand request, CancellationToken cancellationToken)
    {
        if (request.FiscalYearId.HasValue)
        {
            _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId.Value, cancellationToken) ?? throw new NotFoundException($"Fiscal Year with the specified ID ({request.FiscalYearId.Value}) does not exist.");
        }

        var mfoPAPExist = await unitOfWork.MFOPAPRepository.FindAsync(t => t.Name == request.Name && t.Code == request.Code && t.FiscalYearId == request.FiscalYearId, cancellationToken: cancellationToken);
        if (mfoPAPExist != null) throw new ConflictException("MFOPAP already exists.");
        var mfoPAP = new Domain.Entities.Planning.MFOPAP
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive,
            FiscalYearId = request.FiscalYearId
        };
        await unitOfWork.MFOPAPRepository.AddAsync(mfoPAP, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(mfoPAP.Id, "MFOPAP created successfully.");
    }
}
