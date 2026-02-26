using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Commands.UpdatePosition;

public class UpdatePositionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePositionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePositionCommand request, CancellationToken cancellationToken)
    {
        var position = await unitOfWork.PositionRepository.GetByIdAsync(request.Id, cancellationToken);

        if (position == null)
            throw new NotFoundException($"Position with ID '{request.Id}' not found.");

        // Check Code uniqueness if changed
        if (!string.IsNullOrEmpty(request.UpdatePosition.Code) && request.UpdatePosition.Code != position.Code)
        {
            var existingPosition = await unitOfWork.PositionRepository.FindAsync(
                x => x.Code == request.UpdatePosition.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existingPosition != null)
                throw new ConflictException($"Position with Code '{request.UpdatePosition.Code}' already exists.");
        }

        // Validate PositionType if provided
        if (request.UpdatePosition.PositionTypeId.HasValue)
        {
            var positionType = await unitOfWork.PositionTypeRepository.GetByIdAsync(
                request.UpdatePosition.PositionTypeId.Value,
                cancellationToken
            );

            if (positionType == null)
                throw new NotFoundException($"Position Type with ID '{request.UpdatePosition.PositionTypeId}' not found.");

            position.PositionTypeId = request.UpdatePosition.PositionTypeId.Value;
        }

        // Validate PlantillaType if provided
        if (request.UpdatePosition.PlantillaTypeId.HasValue)
        {
            var plantillaType = await unitOfWork.PlantillaTypeRepository.GetByIdAsync(
                request.UpdatePosition.PlantillaTypeId.Value,
                cancellationToken
            );

            if (plantillaType == null)
                throw new NotFoundException($"Plantilla Type with ID '{request.UpdatePosition.PlantillaTypeId}' not found.");

            position.PlantillaTypeId = request.UpdatePosition.PlantillaTypeId.Value;
        }

        // Validate SalaryGrade if provided
        if (request.UpdatePosition.SalaryGradeId.HasValue)
        {
            var salaryGrade = await unitOfWork.SalaryGradeRepository.GetByIdAsync(
                request.UpdatePosition.SalaryGradeId.Value,
                cancellationToken
            );

            if (salaryGrade == null)
                throw new NotFoundException($"Salary Grade with ID '{request.UpdatePosition.SalaryGradeId}' not found.");

            position.SalaryGradeId = request.UpdatePosition.SalaryGradeId.Value;
        }

        // Validate Step if provided
        if (request.UpdatePosition.StepId.HasValue)
        {
            var step = await unitOfWork.StepRepository.GetByIdAsync(
                request.UpdatePosition.StepId.Value,
                cancellationToken
            );

            if (step == null)
                throw new NotFoundException($"Step with ID '{request.UpdatePosition.StepId}' not found.");

            position.StepId = request.UpdatePosition.StepId.Value;
        }

        // Validate Office if provided
        if (request.UpdatePosition.OfficeId.HasValue)
        {
            var office = await unitOfWork.OfficeRepository.GetByIdAsync(
                request.UpdatePosition.OfficeId.Value,
                cancellationToken
            );

            if (office == null)
                throw new NotFoundException($"Office with ID '{request.UpdatePosition.OfficeId}' not found.");

            position.OfficeId = request.UpdatePosition.OfficeId.Value;
        }

        // Update fields
        if (!string.IsNullOrEmpty(request.UpdatePosition.Title))
            position.Title = request.UpdatePosition.Title;

        if (request.UpdatePosition.FunctionalTitle != null)
            position.FunctionalTitle = request.UpdatePosition.FunctionalTitle;

        if (!string.IsNullOrEmpty(request.UpdatePosition.Code))
            position.Code = request.UpdatePosition.Code;

        if (request.UpdatePosition.ItemNumber != null)
            position.ItemNumber = request.UpdatePosition.ItemNumber;

        if (request.UpdatePosition.JobDescription != null)
            position.JobDescription = request.UpdatePosition.JobDescription;

        if (request.UpdatePosition.Qualifications != null)
            position.Qualifications = request.UpdatePosition.Qualifications;

        if (request.UpdatePosition.FTE.HasValue)
            position.FTE = request.UpdatePosition.FTE;

        // Note: OperationalStatus is auto-managed by PersonnelPosition commands
        // Manual updates have been removed to prevent conflicts with automatic updates

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}

