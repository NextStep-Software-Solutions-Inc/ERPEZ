using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;

public class CreateOPCRActivityCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRActivityCommand request, CancellationToken cancellationToken)
    {
        var opcr = await unitOfWork.OPCRRepository.FindAsync(o => o.Id == request.OPCRId, cancellationToken) ?? throw new NotFoundException("OPCR not found.");
        var duKPIAssignment = await unitOfWork.DUKPIAssignmentRepository.FindAsync(d => d.Id == request.DUKPIAssignmentId, cancellationToken) ?? throw new NotFoundException("DU KPI Assignment not found.");

        if (duKPIAssignment.DeliveryUnitId != opcr.DeliveryUnitId)
        {
            throw new BadRequestException("The DU KPI Assignment must belong to the same Delivery Unit as the OPCR.");
        }
        
        if (request.PAPDepartments.Count != 0)
        {
            var deliveryUnits = await unitOfWork.DeliveryUnitRepository.ToListAsync(
                unitOfWork.DeliveryUnitRepository.Query(du => request.PAPDepartments.Contains(du.Id)),
                cancellationToken);

            if (deliveryUnits.Count != request.PAPDepartments.Count)
            {
                throw new BadRequestException("One or more Delivery Units not found.");
            }

            if (deliveryUnits.Any(du => du.ParentId != opcr.DeliveryUnitId))
            {
                throw new BadRequestException("One or more Delivery Units are not children of the OPCR Delivery Unit.");
            }
        }

        // do not allow duplicate OPCRActivity names under the same OPCR and DUKPIAssignment
        var existingActivity = await unitOfWork.OPCRActivityRepository.FindAsync(a => a.OPCRId == request.OPCRId && a.DUKPIAssignmentId == request.DUKPIAssignmentId && a.Name.ToLower() == request.Name.ToLower(), cancellationToken);
        if (existingActivity != null)
        {
            throw new ConflictException("An OPCR Activity with the same name already exists under this OPCR and DUKPI Assignment.");
        }
        
        var opcrActivity = new Domain.Entities.Planning.OPCRActivity
        {
            OPCRId = request.OPCRId,
            DUKPIAssignmentId = request.DUKPIAssignmentId,
            Name = request.Name,
            Description = request.Description,
            Budget = request.Budget,
            OPCRPAPDepartments = request.PAPDepartments.Select(id => new Domain.Entities.Planning.OPCRPAPDepartment
            {
                DeliveryUnitId = id
            }).ToList()
        };

        await unitOfWork.OPCRActivityRepository.AddAsync(opcrActivity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(opcrActivity.Id, "OPCR Activity created successfully.");
    }
}
