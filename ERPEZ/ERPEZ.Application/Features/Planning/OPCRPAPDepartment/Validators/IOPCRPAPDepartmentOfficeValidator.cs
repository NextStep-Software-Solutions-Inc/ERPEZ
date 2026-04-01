namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Validators;

public interface IOPCRPAPDepartmentOfficeValidator
{
    Task ValidateForOPCRActivityAsync(Guid opcrActivityId, IEnumerable<Guid> officeIds, CancellationToken cancellationToken);

    Task ValidateForOPCRItemAsync(Guid opcrItemId, IEnumerable<Guid> officeIds, CancellationToken cancellationToken);
}