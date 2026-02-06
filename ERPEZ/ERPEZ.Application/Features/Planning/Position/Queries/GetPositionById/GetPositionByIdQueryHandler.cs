using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Queries.GetPositionById;

public class GetPositionByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPositionByIdQuery, ApiResponse<PositionResponse>>
{
    public async Task<ApiResponse<PositionResponse>> Handle(GetPositionByIdQuery request, CancellationToken cancellationToken)
    {
        var position = await unitOfWork.PositionRepository.GetByIdAsync(request.Id, cancellationToken);

        if (position == null)
            throw new NotFoundException($"Position with ID '{request.Id}' not found.");

        var response = new PositionResponse
        {
            Id = position.Id,
            Title = position.Title,
            FunctionalTitle = position.FunctionalTitle,
            Code = position.Code,
            JobDescription = position.JobDescription,
            Qualifications = position.Qualifications,
            FTE = position.FTE,
            OperationalStatus = position.OperationalStatus,
            PositionTypeId = position.PositionTypeId,
            PlantillaTypeId = position.PlantillaTypeId,
            SalaryGradeId = position.SalaryGradeId,
            StepId = position.StepId,
            OfficeId = position.OfficeId,
            CreatedAt = position.CreatedAt
        };

        return ApiResponse<PositionResponse>.Success(response);
    }
}
