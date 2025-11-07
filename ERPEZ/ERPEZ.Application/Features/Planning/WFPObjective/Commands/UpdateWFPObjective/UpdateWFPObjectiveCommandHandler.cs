using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.UpdateWFPObjective;

public class UpdateWFPObjectiveCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateWFPObjectiveCommand, ApiResponse<WFPObjectiveDto>>
{
    public async Task<ApiResponse<WFPObjectiveDto>> Handle(UpdateWFPObjectiveCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjective;

        if(dto.WFPId != null)
        {
            _ = await _unitOfWork.WFPRepository.FindAsync(w => w.Id == dto.WFPId, cancellationToken) ?? throw new NotFoundException("WFP not found.");
        }
        var wfpObjective = await _unitOfWork.WFPObjectiveRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Objective not found.");

        var duplicate = await _unitOfWork.WFPObjectiveRepository.FindAsync(
            x => x.WFPId == dto.WFPId && x.Description == dto.Description,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("WFP Objective already exists.");
        
        wfpObjective.Description = dto.Description ?? wfpObjective.Description;
        wfpObjective.WFPId = dto.WFPId ?? wfpObjective.WFPId;

        _unitOfWork.WFPObjectiveRepository.Update(wfpObjective);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new WFPObjectiveDto
        {
            Id = wfpObjective.Id,
            WFPId = wfpObjective.WFPId,
            Description = wfpObjective.Description
        };
        return ApiResponse<WFPObjectiveDto>.Success(result, "WFP Objective updated successfully.");
    }
}
