using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.UpdateWFPObjective;

public class UpdateWFPObjectiveCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPObjectiveCommand, ApiResponse<WFPObjectiveDto>>
{
    public async Task<ApiResponse<WFPObjectiveDto>> Handle(UpdateWFPObjectiveCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjective;
        var wfpObjective = await unitOfWork.WFPObjectiveRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Objective not found.");

        var duplicate = await unitOfWork.WFPObjectiveRepository.FindAsync(
            x => x.Description == dto.Description,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("WFP Objective already exists.");

        wfpObjective.Description = dto.Description ?? wfpObjective.Description;

        unitOfWork.WFPObjectiveRepository.Update(wfpObjective);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new WFPObjectiveDto
        {
            Id = wfpObjective.Id,
            WFPId = wfpObjective.WFPId,
            Description = wfpObjective.Description
        };
        return ApiResponse<WFPObjectiveDto>.Success(result, "WFP Objective updated successfully.");
    }
}
