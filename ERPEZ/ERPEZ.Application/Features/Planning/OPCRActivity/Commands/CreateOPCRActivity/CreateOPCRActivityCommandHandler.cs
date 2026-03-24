using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;

public class CreateOPCRActivityCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRActivityCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OPCRRepository.GetSingleAsync(
            unitOfWork.OPCRRepository.Query(o => o.OPCRItems.Any(i => i.Id == request.OPCRItemId))
                .Select(o => (Guid?)o.Id),
            cancellationToken) ?? throw new NotFoundException("OPCR Item not found.");

        // do not allow duplicate OPCRActivity names under the same OPCR Item
        var existingActivity = await unitOfWork.OPCRActivityRepository.FindAsync(
            a => a.OPCRItemId == request.OPCRItemId && a.Name.ToLower() == request.Name.ToLower(),
            cancellationToken);
        if (existingActivity != null)
        {
            throw new ConflictException("An OPCR Activity with the same name already exists under this OPCR Item.");
        }

        if (request.PAPDepartmentIds.Count != 0)
        {
            var offices = await unitOfWork.OfficeRepository.ToListAsync(
                unitOfWork.OfficeRepository.Query(o => request.PAPDepartmentIds.Contains(o.Id)),
                cancellationToken);

            if (offices.Count != request.PAPDepartmentIds.Count)
            {
                throw new BadRequestException("One or more Offices not found.");
            }
        }

        var opcrActivity = new Domain.Entities.Planning.OPCRActivity
        {
            OPCRItemId = request.OPCRItemId,
            Name = request.Name,
            Description = request.Description,
            Budget = request.Budget,
            OPCRPAPDepartments = [.. request.PAPDepartmentIds.Select(id => new Domain.Entities.Planning.OPCRPAPDepartment
            {
                OfficeId = id
            })]
        };

        await unitOfWork.OPCRActivityRepository.AddAsync(opcrActivity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(opcrActivity.Id, "OPCR Activity created successfully.");
    }
}
