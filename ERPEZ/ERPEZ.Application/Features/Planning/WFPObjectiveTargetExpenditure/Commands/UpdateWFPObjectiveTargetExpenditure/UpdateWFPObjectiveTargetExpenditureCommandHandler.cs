using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.UpdateWFPObjectiveTargetExpenditure;

public class UpdateWFPObjectiveTargetExpenditureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPObjectiveTargetExpenditureCommand, ApiResponse<WFPObjectiveTargetExpenditureResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTargetExpenditureResponse>> Handle(UpdateWFPObjectiveTargetExpenditureCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjectiveTargetExpenditure;
        var abr = await unitOfWork.WFPObjectiveTargetExpenditureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Objective Target Expenditure not found.");

        var duplicate = await unitOfWork.WFPObjectiveTargetExpenditureRepository.FindAsync(
            abr => abr.ItemDescription == dto.ItemDescription &&
            abr.Quantity == dto.Quantity &&
            abr.CostEstimates == dto.CostEstimates,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("WFP Objective Target Expenditure already exists.");

        abr.ItemDescription = dto.ItemDescription ?? abr.ItemDescription;
        abr.Quantity = dto.Quantity;
        abr.CostEstimates = dto.CostEstimates;

        unitOfWork.WFPObjectiveTargetExpenditureRepository.Update(abr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new WFPObjectiveTargetExpenditureResponse
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
            ItemDescription = abr.ItemDescription ?? string.Empty,
            Quantity = abr.Quantity,
            CostEstimates = abr.CostEstimates,
            CreatedAt = abr.CreatedAt,
            CreatedBy = abr.CreatedBy ?? string.Empty
        };
        return ApiResponse<WFPObjectiveTargetExpenditureResponse>.Success(result, "WFP Objective Target Expenditure updated successfully.");
    }
}
