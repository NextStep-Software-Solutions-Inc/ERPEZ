using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.CreateOPCRPAPDepartment;

public class CreateOPCRPAPDepartmentCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRPAPDepartmentCommand, ApiResponse<OPCRPAPDepartmentResponse>>
{
    public async Task<ApiResponse<OPCRPAPDepartmentResponse>> Handle(CreateOPCRPAPDepartmentCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OPCRActivityRepository.FindAsync(k => k.Id == request.OPCRActivityId, cancellationToken) ?? throw new NotFoundException("OPCR Activity not found.");
        _ = await unitOfWork.DeliveryUnitRepository.FindAsync(o => o.Id == request.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found.");
        var opcrPAPDeptExist = await unitOfWork.OPCRPAPDepartmentRepository.FindAsync(
            x => x.OPCRActivityId == request.OPCRActivityId && x.DeliveryUnitId == request.DeliveryUnitId,
            cancellationToken
        );
        if (opcrPAPDeptExist != null)
            throw new ConflictException("OPCR PAP Department with the same OPCR Activity and Delivery Unit already exists.");

        var oPCRPAPDepartment = new Domain.Entities.Planning.OPCRPAPDepartment
        {
            OPCRActivityId = request.OPCRActivityId,
            DeliveryUnitId = request.DeliveryUnitId
        };

        await unitOfWork.OPCRPAPDepartmentRepository.AddAsync(oPCRPAPDepartment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OPCRPAPDepartmentResponse
        {
            Id = oPCRPAPDepartment.Id,
            OPCRActivityId = oPCRPAPDepartment.OPCRActivityId,
            DeliveryUnitId = oPCRPAPDepartment.DeliveryUnitId
        };
        return ApiResponse<OPCRPAPDepartmentResponse>.Success(dto, "OPCR PAP Department created successfully.");
    }
}
