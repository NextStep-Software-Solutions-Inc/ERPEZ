using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.CreateWFPObjectiveTargetExpenditure;

public class CreateWFPObjectiveTargetExpenditureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPObjectiveTargetExpenditureCommand, ApiResponse<WFPObjectiveTargetExpenditureResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTargetExpenditureResponse>> Handle(CreateWFPObjectiveTargetExpenditureCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.WFPObjectiveTargetId, cancellationToken) ?? throw new NotFoundException("WFP Objective Target not found.");
        _ = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectId, cancellationToken) ?? throw new NotFoundException("Object not found.");
        var existingABR = await unitOfWork.WFPObjectiveTargetExpenditureRepository.FindAsync(abr =>
        abr.WFPObjectiveTargetId == request.WFPObjectiveTargetId &&
        abr.ObjectId == request.ObjectId &&
        abr.ItemDescription == request.ItemDescription,
            cancellationToken
        );

        if (existingABR != null)
            throw new ConflictException("WFP Objective Target Expenditure already exist.");

        var abr = new Domain.Entities.Planning.WFPObjectiveTargetExpenditure
        {
            WFPObjectiveTargetId = request.WFPObjectiveTargetId,
            ObjectId = request.ObjectId,
            ItemDescription = request.ItemDescription,
            Quantity = request.Quantity,
            CostEstimates = request.CostEstimates
        };

        await unitOfWork.WFPObjectiveTargetExpenditureRepository.AddAsync(abr, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPObjectiveTargetExpenditureResponse
        {
            Id = abr.Id,
            WFPObjectiveTargetId = abr.WFPObjectiveTargetId,
            Object = new()
            {
                Id = abr.Object.Id,
                ParentId = abr.Object.ParentId,
                Name = abr.Object.Name,
                Code = abr.Object.Code,
            },
            ItemDescription = abr.ItemDescription,
            Quantity = abr.Quantity,
            CostEstimates = abr.CostEstimates
        };
        return ApiResponse<WFPObjectiveTargetExpenditureResponse>.Success(dto, "WFP Objective Target Expenditure created successfully.");
    }
}
