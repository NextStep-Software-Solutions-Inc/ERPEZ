using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.CreateOPCREvaluation;

public class CreateOPCREvaluationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCREvaluationCommand, ApiResponse<OPCREvaluationResponse>>
{
    public async Task<ApiResponse<OPCREvaluationResponse>> Handle(CreateOPCREvaluationCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OPCRRepository.GetByIdAsync(request.OPCRId, cancellationToken) 
            ?? throw new NotFoundException("OPCR not found.");

        var duplicate = await unitOfWork.OPCREvaluationRepository.FindAsync(o => 
        o.OPCRId == request.OPCRId && 
        o.EvaluatorId == request.EvaluatorId
        , cancellationToken);
        if (duplicate != null) throw new ConflictException("OPCR Evaluation already exists.");

        var opcrEvaluation = new Domain.Entities.Planning.OPCREvaluation
        {
            OPCRId = request.OPCRId,
            EvaluatorId = request.EvaluatorId,
            EvaluationDate = request.EvaluationDate,
            Comments = request.Comments,
            Status = request.Status
        };

        await unitOfWork.OPCREvaluationRepository.AddAsync(opcrEvaluation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OPCREvaluationResponse
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
        return ApiResponse<OPCREvaluationResponse>.Success(dto, "OPCR Evaluation created successfully.");
    }
}
