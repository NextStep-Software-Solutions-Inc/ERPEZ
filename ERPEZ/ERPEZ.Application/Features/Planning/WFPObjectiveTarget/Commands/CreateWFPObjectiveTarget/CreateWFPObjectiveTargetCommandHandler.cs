using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.CreateWFPObjectiveTarget;

public class CreateWFPObjectiveTargetCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPObjectiveTargetCommand, ApiResponse<WFPObjectiveTargetResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTargetResponse>> Handle(CreateWFPObjectiveTargetCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await unitOfWork.WFPObjectiveTargetRepository.FindAsync(w =>
        w.WFPObjectiveId == request.WFPObjectiveId &&
        w.ActivityName == request.ActivityName, cancellationToken);
        if (duplicate != null) throw new ConflictException("WFP Objective Target already exists.");

        _ = await unitOfWork.WFPObjectiveRepository.GetByIdAsync(request.WFPObjectiveId, cancellationToken) ?? throw new NotFoundException("WFP Objective not found.");

        var wFPObjectiveTarget = new Domain.Entities.Planning.WFPObjectiveTarget
        {
            WFPObjectiveId = request.WFPObjectiveId,
            ActivityName = request.ActivityName,
            Indicator = request.Indicator,
            Weight = request.Weight
        };

        await unitOfWork.WFPObjectiveTargetRepository.AddAsync(wFPObjectiveTarget, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        var result = new WFPObjectiveTargetResponse()
        {
            Id = wFPObjectiveTarget.Id,
            WFPObjectiveId = wFPObjectiveTarget.WFPObjectiveId,
            ActivityName = wFPObjectiveTarget.ActivityName,
            Indicator = wFPObjectiveTarget.Indicator,
            Weight = wFPObjectiveTarget.Weight,
            CreatedAt = wFPObjectiveTarget.CreatedAt,
            CreatedBy = wFPObjectiveTarget.CreatedBy
        };

        return ApiResponse<WFPObjectiveTargetResponse>.Success(result, "WFP Objective Target created successfully.");
    }
}
