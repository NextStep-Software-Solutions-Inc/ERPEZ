using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.CreateOPCREvaluation;

public class CreateOPCREvaluationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateOPCREvaluationCommand, ApiResponse<OPCREvaluationDto>>
{
    public async Task<ApiResponse<OPCREvaluationDto>> Handle(CreateOPCREvaluationCommand request, CancellationToken cancellationToken)
    {
        _ = await _unitOfWork.OPCRRepository.GetByIdAsync(request.OPCRId, cancellationToken) 
            ?? throw new NotFoundException("OPCR not found.");

        var duplicate = await _unitOfWork.OPCREvaluationRepository.FindAsync(o => 
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

        await _unitOfWork.OPCREvaluationRepository.AddAsync(opcrEvaluation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OPCREvaluationDto
        {
            Id = opcrEvaluation.Id,
            OPCRId = opcrEvaluation.OPCRId,
            EvaluatorId = opcrEvaluation.EvaluatorId,
            EvaluationDate = opcrEvaluation.EvaluationDate,
            Comments = opcrEvaluation.Comments,
            Status = opcrEvaluation.Status
        };
        return ApiResponse<OPCREvaluationDto>.Success(dto, "OPCR Evaluation created successfully.");
    }
}
