using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivities;

public class GetOPCRActivitiesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRActivitiesQuery, PaginatedApiResponse<OPCRActivityResponse>>
{
    public async Task<PaginatedApiResponse<OPCRActivityResponse>> Handle(GetOPCRActivitiesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCRActivity, OPCRActivityResponse>> projection = a => new OPCRActivityResponse
        {
            Id = a.Id,
            OPCRId = a.OPCRId,
            DUKPIAssignmentId = a.DUKPIAssignmentId,
            Name = a.Name,
            Description = a.Description,
            Budget = a.Budget,
            PAPDepartments = a.OPCRPAPDepartments.Select(p => new OPCRPAPDepartmentResponse()
            {
                Id = p.Id,
                OPCRActivityId = p.OPCRActivityId,
                DeliveryUnit = new ()
                {
                    Id = p.DeliveryUnit.Id,
                    CreatedAt = p.DeliveryUnit.CreatedAt,
                    Office = new()
                    {
                        Id = p.DeliveryUnit.Office.Id,
                        Name = p.DeliveryUnit.Office.Name,
                        Address = p.DeliveryUnit.Office.Address,
                        ContactNumber = p.DeliveryUnit.Office.ContactNumber,
                        CreatedBy = p.DeliveryUnit.Office.CreatedBy,
                        CreatedAt = p.DeliveryUnit.Office.CreatedAt,
                        Email = p.DeliveryUnit.Office.Email,
                        Description = p.DeliveryUnit.Office.Description,
                        OfficeHead = p.DeliveryUnit.Office.OfficeHead,
                        ResponsibilityCenterCode = p.DeliveryUnit.Office.ResponsibilityCenterCode,
                        Cluster = p.DeliveryUnit.Office.Cluster == null ? null : new()
                        {
                            Id = p.DeliveryUnit.Office.Cluster.Id,
                            Name = p.DeliveryUnit.Office.Cluster.Name,
                            Description = p.DeliveryUnit.Office.Cluster.Description,
                            CreatedAt = p.DeliveryUnit.Office.Cluster.CreatedAt,
                            CreatedBy = p.DeliveryUnit.Office.Cluster.CreatedBy,
                        }
                    },
                }
            }).ToList()
        };

        var (opcrActivities, totalCount) = await unitOfWork.OPCRActivityRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<OPCRActivityResponse>([.. opcrActivities], query.PageNumber,  query.PageSize, totalCount);
    }
}
