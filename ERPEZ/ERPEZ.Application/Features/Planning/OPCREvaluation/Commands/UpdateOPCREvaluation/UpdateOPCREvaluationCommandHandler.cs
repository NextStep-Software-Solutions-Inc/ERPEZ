using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.UpdateOPCREvaluation;

public class UpdateOPCREvaluationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateOPCREvaluationCommand, ApiResponse<OPCREvaluationDto>>
{
    public async Task<ApiResponse<OPCREvaluationDto>> Handle(UpdateOPCREvaluationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCREvaluation;
        var opcrEvaluation = await _unitOfWork.OPCREvaluationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Evaluation not found.");

        opcrEvaluation.EvaluationDate = dto.EvaluationDate ?? opcrEvaluation.EvaluationDate;
        opcrEvaluation.Comments = dto.Comments ?? opcrEvaluation.Comments;
        if (!string.IsNullOrEmpty(dto.Status))
            opcrEvaluation.Status = dto.Status;

        _unitOfWork.OPCREvaluationRepository.Update(opcrEvaluation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new OPCREvaluationDto
        {
            Id = opcrEvaluation.Id,
            OPCRId = opcrEvaluation.OPCRId,
            EvaluatorId = opcrEvaluation.EvaluatorId,
            EvaluationDate = opcrEvaluation.EvaluationDate,
            Comments = opcrEvaluation.Comments,
            Status = opcrEvaluation.Status
        };
        return ApiResponse<OPCREvaluationDto>.Success(result, "OPCR Evaluation updated successfully.");
    }
}
