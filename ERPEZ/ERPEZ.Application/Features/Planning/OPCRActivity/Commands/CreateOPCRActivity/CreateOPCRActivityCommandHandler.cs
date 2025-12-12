using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;

public class CreateOPCRActivityCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRActivityCommand, ApiResponse<OPCRActivityResponse>>
{
    public async Task<ApiResponse<OPCRActivityResponse>> Handle(CreateOPCRActivityCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OPCRRepository.FindAsync(o => o.Id == request.OPCRId, cancellationToken) ?? throw new NotFoundException("OPCR not found.");
        _ = await unitOfWork.DUKPIAssignmentRepository.FindAsync(d => d.Id == request.DUKPIAssignmentId, cancellationToken) ?? throw new NotFoundException("DU KPI Assignment not found.");
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
            Budget = request.Budget
        };

        await unitOfWork.OPCRActivityRepository.AddAsync(opcrActivity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OPCRActivityResponse
        {
            Id = opcrActivity.Id,
            OPCRId = opcrActivity.OPCRId,
            DUKPIAssignmentId = opcrActivity.DUKPIAssignmentId,
            Name = opcrActivity.Name,
            Description = opcrActivity.Description,
            Budget = opcrActivity.Budget
        };
        return ApiResponse<OPCRActivityResponse>.Success(dto, "OPCR Activity created successfully.");
    }
}
