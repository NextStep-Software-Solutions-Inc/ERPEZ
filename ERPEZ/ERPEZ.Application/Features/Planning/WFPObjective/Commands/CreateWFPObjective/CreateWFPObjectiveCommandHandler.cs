using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjective;

public class CreateWFPObjectiveCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateWFPObjectiveCommand, ApiResponse<WFPObjectiveDto>>
{
    public async Task<ApiResponse<WFPObjectiveDto>> Handle(CreateWFPObjectiveCommand request, CancellationToken cancellationToken)
    {
        _ = await _unitOfWork.WFPRepository.FindAsync(wo => wo.Id == request.WFPId,
            cancellationToken) ?? throw new NotFoundException("WFP not found.");

        var wfpObjective = new Domain.Entities.Planning.WFPObjective
        {
            WFPId = request.WFPId,
            Description = request.Description

        };

        await _unitOfWork.WFPObjectiveRepository.AddAsync(wfpObjective, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPObjectiveDto
        {
            WFPId = request.WFPId,
            Description = request.Description,
        };
        return ApiResponse<WFPObjectiveDto>.Success(dto, "WFP Objective created successfully.");
    }
}
