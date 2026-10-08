using System.Security.Cryptography;
using System.Text.RegularExpressions;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.ScheduleDemo;

public partial class ScheduleDemoCommandHandler(ILogger<ScheduleDemoCommandHandler> logger)
    : IRequestHandler<ScheduleDemoCommand, ApiResponse<DemoResponseDto>>
{
    public Task<ApiResponse<DemoResponseDto>> Handle(ScheduleDemoCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.ContactName))
        {
            return Task.FromResult(ApiResponse<DemoResponseDto>.Fail("Contact name is required."));
        }

        if (string.IsNullOrWhiteSpace(command.OrganizationName))
        {
            return Task.FromResult(ApiResponse<DemoResponseDto>.Fail("Organization name is required."));
        }

        if (string.IsNullOrWhiteSpace(command.Email) || !EmailRegex().IsMatch(command.Email.Trim()))
        {
            return Task.FromResult(ApiResponse<DemoResponseDto>.Fail("A valid work email address is required."));
        }

        var referenceCode = $"DEMO-{DateTime.UtcNow:yyyyMMdd}-{RandomNumberGenerator.GetHexString(6).ToUpperInvariant()}";
        var date = string.IsNullOrWhiteSpace(command.PreferredDate) ? "Next available slot" : command.PreferredDate.Trim();
        var timeSlot = string.IsNullOrWhiteSpace(command.PreferredTimeSlot) ? "Morning (9:00 AM - 12:00 PM)" : command.PreferredTimeSlot.Trim();

        logger.LogInformation(
            "Demo scheduled: Reference={ReferenceCode}, Email={Email}, Organization={Org}, Date={Date}, Slot={Slot}",
            referenceCode, command.Email.Trim(), command.OrganizationName.Trim(), date, timeSlot);

        var responseDto = new DemoResponseDto
        {
            ReferenceCode = referenceCode,
            ContactName = command.ContactName.Trim(),
            OrganizationName = command.OrganizationName.Trim(),
            PreferredDate = date,
            PreferredTimeSlot = timeSlot,
            SubmittedAtUtc = DateTime.UtcNow,
            Message = "Your demonstration request has been received. Our solutions team will confirm calendar details via email."
        };

        return Task.FromResult(ApiResponse<DemoResponseDto>.Success(responseDto, "Demo scheduled successfully."));
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase)]
    private static partial Regex EmailRegex();
}
