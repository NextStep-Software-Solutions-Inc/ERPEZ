using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartments;

public class GetOPCRPAPDepartmentsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRPAPDepartmentsQuery, PaginatedApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>> Handle(GetOPCRPAPDepartmentsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (opcrPAPDepartments, totalCount) = await unitOfWork.OPCRPAPDepartmentRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>(
            [.. opcrPAPDepartments],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
