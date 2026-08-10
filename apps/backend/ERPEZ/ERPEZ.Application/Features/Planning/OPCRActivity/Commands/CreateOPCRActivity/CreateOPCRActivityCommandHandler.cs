using ERPEZ.Domain.Interfaces;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Validators;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;

public class CreateOPCRActivityCommandHandler(
    IUnitOfWork unitOfWork,
    IOPCRPAPDepartmentOfficeValidator officeValidator) : IRequestHandler<CreateOPCRActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRActivityCommand request, CancellationToken cancellationToken)
    {
        var opcrItem = await unitOfWork.OPCRItemRepository.FindAsync(
            i => i.Id == request.OPCRItemId,
            cancellationToken) ?? throw new NotFoundException("OPCR Item not found.");

        var existingActivity = await unitOfWork.OPCRActivityRepository.FindAsync(
            a => a.OPCRItemId == request.OPCRItemId && a.Name.ToLower() == request.Name.ToLower(),
            cancellationToken);
        if (existingActivity != null)
        {
            throw new ConflictException("An OPCR Activity with the same name already exists under this OPCR Item.");
        }

        await officeValidator.ValidateForOPCRItemAsync(request.OPCRItemId, request.PAPDepartmentIds, cancellationToken);

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