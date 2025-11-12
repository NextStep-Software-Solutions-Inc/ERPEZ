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
        _ = await unitOfWork.OPCRKPIRepository.FindAsync(o => o.Id == request.OPCRKPIId, cancellationToken) ?? throw new NotFoundException("OPCR KPI not found.");
        var opcrActivity = new Domain.Entities.Planning.OPCRActivity
        {
            OPCRKPIId = request.OPCRKPIId,
            Name = request.Name,
            Description = request.Description,
            Budget = request.Budget
        };

        await unitOfWork.OPCRActivityRepository.AddAsync(opcrActivity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OPCRActivityDto
        {
            Id = opcrActivity.Id,
            OPCRKPIId = opcrActivity.OPCRKPIId,
            Name = opcrActivity.Name,
            Description = opcrActivity.Description,
            Budget = opcrActivity.Budget
        };
        return ApiResponse<OPCRActivityDto>.Success(dto, "OPCR Activity created successfully.");
    }
}
