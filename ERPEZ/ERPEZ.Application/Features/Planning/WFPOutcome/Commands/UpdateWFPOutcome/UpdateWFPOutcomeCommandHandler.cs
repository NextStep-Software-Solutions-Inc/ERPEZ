using ERPEZ.Application.Features.Planning.WFPOutcome.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.UpdateWFPOutcome;

public class UpdateWFPOutcomeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPOutcomeCommand, ApiResponse<WFPOutcomeResponse>>
{
    public async Task<ApiResponse<WFPOutcomeResponse>> Handle(UpdateWFPOutcomeCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPOutcome;

        var wFPOutcome = await unitOfWork.WFPOutcomeRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Outcome not found.");

        if (wFPOutcome.Id == request.Id && wFPOutcome.Description == dto.Description) throw new ConflictException("WFP Outcome already exist.");

        wFPOutcome.Description = dto.Description ?? wFPOutcome.Description;

        unitOfWork.WFPOutcomeRepository.Update(wFPOutcome);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var res = new WFPOutcomeResponse
        {
            Id = wFPOutcome.Id,
            WFPObjectiveId = wFPOutcome.WFPObjectiveId,
            Description = wFPOutcome.Description
        };
        return ApiResponse<WFPOutcomeResponse>.Success(res, "WFP Outcome updated successfully.");
    }
}
