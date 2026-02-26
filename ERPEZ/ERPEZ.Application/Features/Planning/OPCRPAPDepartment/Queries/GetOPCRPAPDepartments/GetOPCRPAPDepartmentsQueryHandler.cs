using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartments;

public class GetOPCRPAPDepartmentsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRPAPDepartmentsQuery, PaginatedApiResponse<OPCRPAPDepartmentResponse>>
{
    public async Task<PaginatedApiResponse<OPCRPAPDepartmentResponse>> Handle(GetOPCRPAPDepartmentsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCRPAPDepartment, OPCRPAPDepartmentResponse>> projection = dept => new OPCRPAPDepartmentResponse
        {
            Id = dept.Id,
            OPCRActivityId = dept.OPCRActivityId,
            DeliveryUnit = new DeliveryUnitResponse
            {
                Id = dept.DeliveryUnit.Id,
                Office = new OfficeResponse
                {
                    Id = dept.DeliveryUnit.Office.Id,
                    Name = dept.DeliveryUnit.Office.Name,
                    Code = dept.DeliveryUnit.Office.Code,
                    Description = dept.DeliveryUnit.Office.Description,
                    Address = dept.DeliveryUnit.Office.Address,
                    ResponsibilityCenterCode = dept.DeliveryUnit.Office.ResponsibilityCenterCode,
                    ClusterId = dept.DeliveryUnit.Office.ClusterId,
                    Cluster = null
                },
                ParentId = dept.DeliveryUnit.ParentId,
                CreatedAt = dept.DeliveryUnit.CreatedAt
            }
        };

        var (opcrPAPDepartments, totalCount) = await unitOfWork.OPCRPAPDepartmentRepository.GetAllAsync(sieveModel, projection, cancellationToken);
        return new PaginatedApiResponse<OPCRPAPDepartmentResponse>(
            [.. opcrPAPDepartments],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
