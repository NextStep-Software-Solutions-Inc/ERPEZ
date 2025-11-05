using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.UpdateWFPOutcome;

public class UpdateWFPOutcomeCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateWFPOutcomeCommand, ApiResponse<Domain.Entities.Planning.WFPOutcome>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFPOutcome>> Handle(UpdateWFPOutcomeCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPOutcome;

        if (dto.WFPObjectiveId != null)
        {
            _ = await _unitOfWork.WFPObjectiveRepository.FindAsync(w => w.Id == dto.WFPObjectiveId, cancellationToken) ?? throw new NotFoundException("WFP Objective not found.");
        }
        var wFPOutcome = await _unitOfWork.WFPOutcomeRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Outcome not found.");

        var duplicate = await _unitOfWork.WFPObjectiveRepository.FindAsync(
            x => x.WFPId == dto.WFPObjectiveId && x.Description == dto.Description,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("WFP Outcome already exists.");

        wFPOutcome.WFPObjectiveId = dto.WFPObjectiveId ?? wFPOutcome.WFPObjectiveId;
        wFPOutcome.Description = dto.Description ?? wFPOutcome.Description;

        _unitOfWork.WFPOutcomeRepository.Update(wFPOutcome);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.WFPOutcome>.Success(wFPOutcome, "WFP Outcome updated successfully.");
    }
}
