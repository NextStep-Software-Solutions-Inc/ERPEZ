using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.CreateKPIAssignment;

public class CreateKPIAssignmentCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateKPIAssignmentCommand, ApiResponse<Domain.Entities.Planning.KPIAssignment>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPIAssignment>> Handle(CreateKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        if (request.DeliveryUnitId == Guid.Empty || request.KPIId == Guid.Empty)
        {
            return new ApiResponse<Domain.Entities.Planning.KPIAssignment>
            {
                Message = "KPI and Delivery Unit are required.",
                Succeeded = false
            };
        }
        var deliveryUnit = await _unitOfWork.KPIAssignmentRepository.FindAsync(
            t => t.KPIId == request.KPIId && t.DeliveryUnitId == request.DeliveryUnitId,
            cancellationToken: cancellationToken
        );

        if (deliveryUnit != null)
            throw new ConflictException("KPIAssigment already exists.");

        if (request.KPIId != Guid.Empty)
        {
            var kpi = await _unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI not found.");
        }

        if (request.DeliveryUnitId != Guid.Empty)
        {
            var du = await _unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.DeliveryUnitId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Delivery Unit not found.");
        }

        var kpiAssignment = new Domain.Entities.Planning.KPIAssignment
        {
            KPIId = request.KPIId,
            DeliveryUnitId = request.DeliveryUnitId
        };

        await _unitOfWork.KPIAssignmentRepository.AddAsync(kpiAssignment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var dto = new Domain.Entities.Planning.KPIAssignment
        {
            Id = kpiAssignment.Id,
            KPIId = kpiAssignment.KPIId,
            DeliveryUnitId = kpiAssignment.DeliveryUnitId
        };
        return ApiResponse<Domain.Entities.Planning.KPIAssignment>.Success(dto, "KPI Assignment created successfully.");
    }
}