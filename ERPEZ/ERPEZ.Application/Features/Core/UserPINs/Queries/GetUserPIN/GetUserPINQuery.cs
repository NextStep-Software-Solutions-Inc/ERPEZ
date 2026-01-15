using ERPEZ.Domain.Dtos.Core;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Core.UserPINs.Queries.GetUserPIN;

/// <summary>
/// Query to get the authenticated user's PIN status.
/// </summary>
public class GetUserPINQuery : IRequest<ApiResponse<UserPINResponse>>
{
}
