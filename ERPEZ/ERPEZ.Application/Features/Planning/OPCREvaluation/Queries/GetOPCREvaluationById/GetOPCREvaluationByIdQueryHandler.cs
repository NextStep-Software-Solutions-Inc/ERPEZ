using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluationById;

public class GetOPCREvaluationByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetOPCREvaluationByIdQuery, ApiResponse<Domain.Entities.Planning.OPCREvaluation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCREvaluation>> Handle(GetOPCREvaluationByIdQuery request, CancellationToken cancellationToken)
    {
        var opcrEvaluation = await _unitOfWork.OPCREvaluationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.OPCREvaluation>.Success(opcrEvaluation, "Retrieved successfully");
    }
}
