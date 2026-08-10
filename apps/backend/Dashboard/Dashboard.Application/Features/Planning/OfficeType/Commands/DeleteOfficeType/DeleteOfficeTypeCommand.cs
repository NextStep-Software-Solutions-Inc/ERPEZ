using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OfficeType.Commands.DeleteOfficeType;

public record DeleteOfficeTypeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
