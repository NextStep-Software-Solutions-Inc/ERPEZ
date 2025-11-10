using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public class CreateDUKPIAssignmentCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateDUKPIAssignmentCommand, ApiResponse<DUKPIAssignmentDto>>
{
    public async Task<ApiResponse<DUKPIAssignmentDto>> Handle(CreateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var dukpi = await _unitOfWork.DUKPIAssignmentRepository.FindAsync(
            t => t.KPIId == request.KPIId && t.DeliveryUnitId == request.DeliveryUnitId,
            cancellationToken: cancellationToken
        );

        if (dukpi != null)
            throw new ConflictException("DU KPI Assigment already exists.");

        _ = await _unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");
        
        _ = await _unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.DeliveryUnitId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Delivery Unit not found.");

        var duKpiAssignment = new Domain.Entities.Planning.DUKPIAssignment
        {
            KPIId = request.KPIId,
            DeliveryUnitId = request.DeliveryUnitId,
            KPITargetId = request.KPITargetId,
            AllocatedTargetValue = request.AllocatedTargetValue,
        };

        await _unitOfWork.DUKPIAssignmentRepository.AddAsync(duKpiAssignment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var res = new DUKPIAssignmentDto
        {
            Id = duKpiAssignment.Id,
            KPIId = duKpiAssignment.KPIId,
            DeliveryUnitId = duKpiAssignment.DeliveryUnitId,
            KPITargetId = duKpiAssignment.KPITargetId,
            AllocatedTargetValue = duKpiAssignment.AllocatedTargetValue
        };
        return ApiResponse<DUKPIAssignmentDto>.Success(res, "DU KPI Assignment created successfully.");
    }
}