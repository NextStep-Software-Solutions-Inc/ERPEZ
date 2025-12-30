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
        var opcrActivity = await unitOfWork.OPCRActivityRepository.FindAsync(k => k.Id == request.OPCRActivityId, cancellationToken) ?? throw new NotFoundException("OPCR Activity not found.");
        var deliveryUnit = await unitOfWork.DeliveryUnitRepository.FindAsync(o => o.Id == request.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found.");
        
        // Get the OPCR to check its delivery unit
        var opcr = await unitOfWork.OPCRRepository.FindAsync(o => o.Id == opcrActivity.OPCRId, cancellationToken) ?? throw new NotFoundException("OPCR not found.");
        
        // Ensure the delivery unit is not the same as the OPCR's delivery unit 
        if (opcr.DeliveryUnitId == request.DeliveryUnitId) throw new ConflictException("Delivery unit cannot be the same as the OPCR's delivery unit.");
        
        if(opcr.DeliveryUnitId != deliveryUnit.ParentId)
            throw new ConflictException("The selected Delivery Unit is not a valid PAP Department for the OPCR Activity. It must be a child of the OPCR's Delivery Unit.");
        
        // Ensure parent delivery units cannot be PAP departments
        var childDeliveryUnits = await unitOfWork.DeliveryUnitRepository.ToListAsync(
            unitOfWork.DeliveryUnitRepository.Query(du => du.ParentId == request.DeliveryUnitId), 
            cancellationToken);
        if (childDeliveryUnits.Any())
            throw new ConflictException("Parent delivery units cannot be assigned as PAP departments.");

        var opcrPAPDeptExist = await unitOfWork.OPCRPAPDepartmentRepository.FindAsync(x => x.OPCRActivityId == request.OPCRActivityId && x.DeliveryUnitId == request.DeliveryUnitId, cancellationToken);
        if (opcrPAPDeptExist != null)
            throw new ConflictException("OPCR PAP Department with the same OPCR Activity and Delivery Unit already exists.");

        var oPCRPAPDepartment = new Domain.Entities.Planning.OPCRPAPDepartment
        {
            OPCRActivityId = request.OPCRActivityId,
            DeliveryUnitId = request.DeliveryUnitId
        };

        await unitOfWork.OPCRPAPDepartmentRepository.AddAsync(oPCRPAPDepartment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(oPCRPAPDepartment.Id, "OPCR PAP Department created successfully.");
    }
}
