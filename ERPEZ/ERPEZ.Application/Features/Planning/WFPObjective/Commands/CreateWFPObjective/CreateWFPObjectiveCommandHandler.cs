using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjective;

public class CreateWFPObjectiveCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPObjectiveCommand, ApiResponse<WFPObjectiveDto>>
{
    public async Task<ApiResponse<WFPObjectiveDto>> Handle(CreateWFPObjectiveCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.WFPRepository.FindAsync(wo => wo.Id == request.WFPId,
            cancellationToken) ?? throw new NotFoundException("WFP not found.");

        var duplicate = await unitOfWork.WFPObjectiveRepository.FindAsync(w => w.WFPId == request.WFPId && w.Description == request.Description, cancellationToken);
        if (duplicate != null) throw new ConflictException("WFP Objective already exist.");

        var wfpObjective = new Domain.Entities.Planning.WFPObjective
        {
            WFPId = request.WFPId,
            Description = request.Description

        };

        await unitOfWork.WFPObjectiveRepository.AddAsync(wfpObjective, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPObjectiveDto
        {
            Id = wfpObjective.Id,
            WFPId = request.WFPId,
            Description = request.Description,
        };
        return ApiResponse<WFPObjectiveDto>.Success(dto, "WFP Objective created successfully.");
    }
}
