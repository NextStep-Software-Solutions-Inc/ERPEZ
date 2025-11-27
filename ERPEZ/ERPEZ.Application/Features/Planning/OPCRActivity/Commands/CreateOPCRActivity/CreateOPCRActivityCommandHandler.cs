using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;

public class CreateOPCRActivityCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRActivityCommand, ApiResponse<OPCRActivityDto>>
{
    public async Task<ApiResponse<OPCRActivityDto>> Handle(CreateOPCRActivityCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OPCRRepository.FindAsync(o => o.Id == request.OPCRId, cancellationToken) ?? throw new NotFoundException("OPCR not found.");
        _ = await unitOfWork.DUKPIAssignmentRepository.FindAsync(d => d.Id == request.DUKPIAssignmentId, cancellationToken) ?? throw new NotFoundException("DU KPI Assignment not found.");
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

        var dto = new OPCRActivityDto
        {
            Id = opcrActivity.Id,
            OPCRId = opcrActivity.OPCRId,
            DUKPIAssignmentId = opcrActivity.DUKPIAssignmentId,
            Name = opcrActivity.Name,
            Description = opcrActivity.Description,
            Budget = opcrActivity.Budget
        };
        return ApiResponse<OPCRActivityDto>.Success(dto, "OPCR Activity created successfully.");
    }
}
