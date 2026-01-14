using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.CreateOPCRActivityEvaluation;

public class CreateOPCRActivityEvaluationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOPCRActivityEvaluationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRActivityEvaluationCommand request, CancellationToken cancellationToken)
    {
        // Verify OPCRActivityRating exists and get its details
        var rating = await unitOfWork.OPCRActivityRatingRepository.GetByIdWithDetailsAsync(
            request.OPCRActivityRatingId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity Rating not found.");

        // Verify the rating is submitted (cannot evaluate a draft rating)
        if (rating.Status != Domain.Enums.OPCRActivityRatingStatus.Submitted)
        {
            throw new ValidationException("Cannot evaluate a rating that has not been submitted.");
        }

        // Check for duplicate evaluation (one evaluation per rating)
        var duplicate = await unitOfWork.OPCRActivityEvaluationRepository.FindAsync(
            e => e.OPCRActivityRatingId == request.OPCRActivityRatingId,
            cancellationToken: cancellationToken);

        if (duplicate != null)
        {
            throw new ConflictException("An evaluation for this rating already exists.");
        }

        // Verify that the RatingId belongs to the ActivityId in the evaluation context
        // This is already guaranteed by the FK relationship, but we add explicit validation
        var opcrActivity = await unitOfWork.OPCRActivityRepository.GetByIdAsync(
            rating.OPCRActivityId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity not found.");

        // Create the evaluation
        var evaluation = new Domain.Entities.Planning.OPCRActivityEvaluation
        {
            OPCRActivityRatingId = request.OPCRActivityRatingId,
            EvaluatorScore = request.EvaluatorScore,
            Remarks = request.Remarks,
            EvaluatedDate = request.EvaluatedDate,
            Status = request.Status
        };

        await unitOfWork.OPCRActivityEvaluationRepository.AddAsync(evaluation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(evaluation.Id, "OPCR Activity Evaluation created successfully.");
    }
}
