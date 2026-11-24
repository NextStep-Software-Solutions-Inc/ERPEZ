using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEventById;

public record GetCalendarEventByIdQuery(Guid Id) : IRequest<ApiResponse<CalendarEventResponse>>;
