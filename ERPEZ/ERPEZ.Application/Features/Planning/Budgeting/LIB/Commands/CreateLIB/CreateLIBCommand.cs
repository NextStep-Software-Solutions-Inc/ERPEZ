using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.CreateLIB;

public record CreateLIBCommand(CreateLIBRequest Request) : IRequest<ApiResponse<Guid>>;




