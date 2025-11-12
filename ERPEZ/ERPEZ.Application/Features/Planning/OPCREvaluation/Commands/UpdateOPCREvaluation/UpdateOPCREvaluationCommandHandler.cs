using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.UpdateOPCREvaluation;

public class UpdateOPCREvaluationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOPCREvaluationCommand, ApiResponse<OPCREvaluationResponse>>
{
    public async Task<ApiResponse<OPCREvaluationResponse>> Handle(UpdateOPCREvaluationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCREvaluation;
        var opcrEvaluation = await unitOfWork.OPCREvaluationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Evaluation not found.");

        opcrEvaluation.EvaluationDate = dto.EvaluationDate ?? opcrEvaluation.EvaluationDate;
        opcrEvaluation.Comments = dto.Comments ?? opcrEvaluation.Comments;
        if (!string.IsNullOrEmpty(dto.Status))
            opcrEvaluation.Status = dto.Status;

        unitOfWork.OPCREvaluationRepository.Update(opcrEvaluation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new OPCREvaluationResponse
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
        return ApiResponse<OPCREvaluationResponse>.Success(result, "OPCR Evaluation updated successfully.");
    }
}
