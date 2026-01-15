using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.CreateOPCRActivityEvaluationsBatch;

/// <summary>
/// Handler for creating multiple OPCR Activity Evaluations in a single batch operation.
/// </summary>
public class CreateOPCRActivityEvaluationsBatchCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOPCRActivityEvaluationsBatchCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(CreateOPCRActivityEvaluationsBatchCommand request, CancellationToken cancellationToken)
    {
        var evaluationsToCreate = new List<Domain.Entities.Planning.OPCRActivityEvaluation>();
        var processedRatingIds = new HashSet<Guid>();

        foreach (var evaluationRequest in request.Evaluations)
        {
            // Check for duplicate rating IDs within the batch
            if (!processedRatingIds.Add(evaluationRequest.OPCRActivityRatingId))
            {
                throw new ValidationException($"Duplicate OPCR Activity Rating ID '{evaluationRequest.OPCRActivityRatingId}' found in batch.");
            }

            // Verify OPCRActivityRating exists and get its details
            var rating = await unitOfWork.OPCRActivityRatingRepository.GetByIdWithDetailsAsync(
                evaluationRequest.OPCRActivityRatingId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"OPCR Activity Rating with ID '{evaluationRequest.OPCRActivityRatingId}' not found.");

            // Get the OPCR to check rating status
            var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(rating.OPCRActivity.OPCRId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"OPCR not found for rating ID '{evaluationRequest.OPCRActivityRatingId}'.");

            // Verify the OPCR rating is submitted (cannot evaluate if not submitted)
            if (opcr.RatingStatus != Domain.Enums.OPCRRatingStatus.Submitted)
            {
                throw new ValidationException($"Cannot evaluate rating '{evaluationRequest.OPCRActivityRatingId}' - OPCR rating status is not submitted.");
            }

            // Check for duplicate evaluation (one evaluation per rating)
            var duplicate = await unitOfWork.OPCRActivityEvaluationRepository.FindAsync(
                e => e.OPCRActivityRatingId == evaluationRequest.OPCRActivityRatingId,
                cancellationToken: cancellationToken);

            if (duplicate != null)
            {
                throw new ConflictException($"An evaluation for rating '{evaluationRequest.OPCRActivityRatingId}' already exists.");
            }

            // Create the evaluation
            var evaluation = new Domain.Entities.Planning.OPCRActivityEvaluation
            {
                OPCRActivityRatingId = evaluationRequest.OPCRActivityRatingId,
                EvaluatorScore = evaluationRequest.EvaluatorScore,
                Remarks = evaluationRequest.Remarks,
                Status = Domain.Enums.OPCREvaluationStatus.Pending
            };

            evaluationsToCreate.Add(evaluation);
        }

        // Add all evaluations to the repository
        foreach (var evaluation in evaluationsToCreate)
        {
            await unitOfWork.OPCRActivityEvaluationRepository.AddAsync(evaluation, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"{evaluationsToCreate.Count} OPCR Activity Evaluations created successfully.");
    }
}