using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Queries.GetWFPObjectiveTargetExpenditureById;

public class GetWFPObjectiveTargetExpenditureByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectiveTargetExpenditureByIdQuery, ApiResponse<WFPObjectiveTargetExpenditureResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTargetExpenditureResponse>> Handle(GetWFPObjectiveTargetExpenditureByIdQuery request, CancellationToken cancellationToken)
    {
        var abr = await unitOfWork.WFPObjectiveTargetExpenditureRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");
        var result = new WFPObjectiveTargetExpenditureResponse()
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
            CreatedBy = abr.CreatedBy ?? string.Empty,
            CreatedAt = abr.CreatedAt
        };
        return ApiResponse<WFPObjectiveTargetExpenditureResponse>.Success(result, "Retrieved successfully");
    }
}
