using ERPEZ.Application.Features.Planning.WFPOutcome.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.CreateWFPOutcome;

public class CreateWFPOutcomeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPOutcomeCommand, ApiResponse<WFPOutcomeResponse>>
{
    public async Task<ApiResponse<WFPOutcomeResponse>> Handle(CreateWFPOutcomeCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.WFPObjectiveRepository.FindAsync(wo => wo.Id == request.WFPObjectiveId,
            cancellationToken) ?? throw new NotFoundException("WFP Objective not found.");

        var wfpOutcome = new Domain.Entities.Planning.WFPOutcome
        {
            WFPObjectiveId = request.WFPObjectiveId,
            Description = request.Description

        };

        await unitOfWork.WFPOutcomeRepository.AddAsync(wfpOutcome, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPOutcomeResponse
        {
            WFPObjectiveId = wfpOutcome.WFPObjectiveId,
            Description = request.Description,
        };
        return ApiResponse<WFPOutcomeResponse>.Success(dto, "WFP Outcome created successfully.");
    }
}
