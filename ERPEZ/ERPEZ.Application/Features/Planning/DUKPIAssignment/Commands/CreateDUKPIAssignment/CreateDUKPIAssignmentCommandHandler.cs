using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public class CreateDUKPIAssignmentCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateDUKPIAssignmentCommand, ApiResponse<Domain.Entities.Planning.DUKPIAssignment>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DUKPIAssignment>> Handle(CreateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        if (request.DeliveryUnitId == Guid.Empty || request.KPIId == Guid.Empty)
        {
            return new ApiResponse<Domain.Entities.Planning.DUKPIAssignment>
            {
                Message = "KPI and Delivery Unit are required.",
                Succeeded = false
            };
        }
        var deliveryUnit = await _unitOfWork.DUKPIAssignmentRepository.FindAsync(
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

        var kpiAssignment = new Domain.Entities.Planning.DUKPIAssignment
        {
            KPIId = request.KPIId,
            DeliveryUnitId = request.DeliveryUnitId
        };

        await _unitOfWork.DUKPIAssignmentRepository.AddAsync(kpiAssignment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Domain.Entities.Planning.DUKPIAssignment>.Success(kpiAssignment, "KPI Assignment created successfully.");
    }
}