using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.CreateOPCRRating;

public class CreateOPCRRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRRatingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRRatingCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OPCREvaluationRepository.FindAsync(o => o.Id == request.OPCREvaluationId,
            cancellationToken) ?? throw new NotFoundException("OPCR Evaluation not found.");

        _ = await unitOfWork.PerformanceMeasureRepository.FindAsync(o => o.Id == request.PerformanceMeasureId,
            cancellationToken) ?? throw new NotFoundException("Performance Measure not found.");

        _ = await unitOfWork.OPCRRepository.FindAsync(o => o.Id == request.OPCRId,
            cancellationToken) ?? throw new NotFoundException("OPCR not found.");

        _ = await unitOfWork.DUKPITargetAssignmentRepository.FindAsync(d => d.Id == request.DUKPITargetAssignmentId,
            cancellationToken) ?? throw new NotFoundException("DU KPI Assignment not found.");

        var opcrRating = new Domain.Entities.Planning.OPCRRating
        {
            OPCRId = request.OPCRId,
            DUKPITargetAssignmentId = request.DUKPITargetAssignmentId,
            OPCREvaluationId = request.OPCREvaluationId,
            PerformanceMeasureId = request.PerformanceMeasureId,
            NumericalRating = request.NumericalRating,
            Remarks = request.Remarks
        };

        await unitOfWork.OPCRRatingRepository.AddAsync(opcrRating, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(opcrRating.Id, "OPCR Rating created successfully.");
    }
}
