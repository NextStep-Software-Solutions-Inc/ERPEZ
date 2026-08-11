using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Validators;

public class OPCRPAPDepartmentOfficeValidator(IUnitOfWork unitOfWork) : IOPCRPAPDepartmentOfficeValidator
{
    public async Task ValidateForOPCRActivityAsync(Guid opcrActivityId, IEnumerable<Guid> officeIds, CancellationToken cancellationToken)
    {
        var opcrOfficeId = await unitOfWork.OPCRActivityRepository.GetSingleAsync(
            unitOfWork.OPCRActivityRepository.Query(activity => activity.Id == opcrActivityId)
                .Select(activity => (Guid?)activity.OPCRItem.OPCR.OfficeId),
            cancellationToken) ?? throw new NotFoundException("OPCR Activity not found.");

        await ValidateSubOfficeAssignmentsAsync(opcrOfficeId, officeIds, cancellationToken);
    }

    public async Task ValidateForOPCRItemAsync(Guid opcrItemId, IEnumerable<Guid> officeIds, CancellationToken cancellationToken)
    {
        var opcrOfficeId = await unitOfWork.OPCRItemRepository.GetSingleAsync(
            unitOfWork.OPCRItemRepository.Query(item => item.Id == opcrItemId)
                .Select(item => (Guid?)item.OPCR.OfficeId),
            cancellationToken) ?? throw new NotFoundException("OPCR Item not found.");

        await ValidateSubOfficeAssignmentsAsync(opcrOfficeId, officeIds, cancellationToken);
    }

    private async Task ValidateSubOfficeAssignmentsAsync(Guid opcrOfficeId, IEnumerable<Guid> officeIds, CancellationToken cancellationToken)
    {
        var requestedOfficeIds = officeIds
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        if (requestedOfficeIds.Count == 0)
        {
            return;
        }

        var offices = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query(office => requestedOfficeIds.Contains(office.Id)),
            cancellationToken);

        if (offices.Count != requestedOfficeIds.Count)
        {
            throw new BadRequestException("One or more Offices not found.");
        }

        var invalidOffices = offices
            .Where(office => office.ParentId != opcrOfficeId)
            .Select(office => $"{office.Name} ({office.Id})")
            .ToList();

        if (invalidOffices.Count != 0)
        {
            throw new BadRequestException(
                $"Selected PAP departments must be direct sub-offices of the OPCR office. Invalid offices: {string.Join(", ", invalidOffices)}.");
        }
    }
}