using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluationById;

public class GetOPCREvaluationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCREvaluationByIdQuery, ApiResponse<OPCREvaluationResponse>>
{
    public async Task<ApiResponse<OPCREvaluationResponse>> Handle(GetOPCREvaluationByIdQuery request, CancellationToken cancellationToken)
    {
        var opcrEvaluation = await unitOfWork.OPCREvaluationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");
        var dto = new OPCREvaluationResponse()
        {
            Id = opcrEvaluation.Id,
            OPCRId = opcrEvaluation.OPCRId,
            EvaluatorId = opcrEvaluation.EvaluatorId,
            EvaluationDate = opcrEvaluation.EvaluationDate,
            Comments = opcrEvaluation.Comments,
            Status = opcrEvaluation.Status,
            CreatedAt = opcrEvaluation.CreatedAt,
            CreatedBy = opcrEvaluation.CreatedBy
        };
        return ApiResponse<OPCREvaluationResponse>.Success(dto, "Retrieved successfully");
    }
}
