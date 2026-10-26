using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Commands.CreatePosition;

public class CreatePositionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreatePositionCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePositionCommand request, CancellationToken cancellationToken)
    {
        // Check Code uniqueness
        var existingPosition = await unitOfWork.PositionRepository.FindAsync(
            x => x.Code == request.Code,
            cancellationToken
        );

        if (existingPosition != null)
            throw new ConflictException($"Position with Code '{request.Code}' already exists.");

        // Validate PositionType exists
        var positionType = await unitOfWork.PositionTypeRepository.GetByIdAsync(
            request.PositionTypeId,
            cancellationToken
        );

        if (positionType == null)
            throw new NotFoundException($"Position Type with ID '{request.PositionTypeId}' not found.");

        // Validate PlantillaType exists
        var plantillaType = await unitOfWork.PlantillaTypeRepository.GetByIdAsync(
            request.PlantillaTypeId,
            cancellationToken
        );

        if (plantillaType == null)
            throw new NotFoundException($"Plantilla Type with ID '{request.PlantillaTypeId}' not found.");

        // Validate SalaryGrade exists
        var salaryGrade = await unitOfWork.SalaryGradeRepository.GetByIdAsync(
            request.SalaryGradeId,
            cancellationToken
        );

        if (salaryGrade == null)
            throw new NotFoundException($"Salary Grade with ID '{request.SalaryGradeId}' not found.");

        // Validate Step exists
        var step = await unitOfWork.StepRepository.GetByIdAsync(
            request.StepId,
            cancellationToken
        );

        if (step == null)
            throw new NotFoundException($"Step with ID '{request.StepId}' not found.");

        // Validate Office exists
        var office = await unitOfWork.OfficeRepository.GetByIdAsync(
            request.OfficeId,
            cancellationToken
        );

        if (office == null)
            throw new NotFoundException($"Office with ID '{request.OfficeId}' not found.");

        // Create entity
        var position = new Domain.Entities.Planning.Position
        {
            Title = request.Title,
            FunctionalTitle = request.FunctionalTitle,
            Code = request.Code,
            ItemNumber = request.ItemNumber,
            JobDescription = request.JobDescription,
            Qualifications = request.Qualifications,
            FTE = request.FTE,
            OperationalStatus = request.OperationalStatus,
            PositionTypeId = request.PositionTypeId,
            PlantillaTypeId = request.PlantillaTypeId,
            SalaryGradeId = request.SalaryGradeId,
            StepId = request.StepId,
            OfficeId = request.OfficeId
        };

        await unitOfWork.PositionRepository.AddAsync(position, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(position.Id);
    }
}
