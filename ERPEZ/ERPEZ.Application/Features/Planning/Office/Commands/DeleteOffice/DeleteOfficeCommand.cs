using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.DeleteOffice;

public record class DeleteOfficeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
