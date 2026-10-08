using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.RequestQuote;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.ScheduleDemo;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.SubscribeNewsletter;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Inquiries;

public class InquiriesCommandHandlerTests
{
    [Fact]
    public async Task RequestQuote_WithValidData_ReturnsSuccessWithReferenceCode()
    {
        var handler = new RequestQuoteCommandHandler(NullLogger<RequestQuoteCommandHandler>.Instance);
        var command = new RequestQuoteCommand
        {
            PlanName = "Professional",
            Tier = "Professional",
            DeploymentType = "saas",
            ContactName = "Jane Doe",
            Email = "jane@enterprise.gov",
            OrganizationName = "Department of Agriculture",
            TeamSize = "16-50",
            RequestedModules = ["ams", "pbms", "pms"]
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.StartsWith("QT-", result.Data.ReferenceCode);
        Assert.Equal("Professional", result.Data.PlanName);
        Assert.Equal("Cloud SaaS (Datacenter)", result.Data.DeploymentType);
        Assert.Equal(3, result.Data.IncludedModules.Count);
    }

    [Fact]
    public async Task RequestQuote_WithAirGappedDeployment_ReturnsOnPremiseScope()
    {
        var handler = new RequestQuoteCommandHandler(NullLogger<RequestQuoteCommandHandler>.Instance);
        var command = new RequestQuoteCommand
        {
            PlanName = "On-Premise Foundation",
            Tier = "Starter",
            DeploymentType = "on-premise",
            ContactName = "John Smith",
            Email = "john@defense.gov",
            OrganizationName = "Security Bureau",
            TeamSize = "1-15"
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.Equal("Air-Gapped On-Premise", result.Data.DeploymentType);
        Assert.Contains("offline license", result.Data.EstimatedDelivery);
    }

    [Theory]
    [InlineData("", "Org", "valid@email.com", "Contact name")]
    [InlineData("Name", "", "valid@email.com", "Organization name")]
    [InlineData("Name", "Org", "invalid-email", "valid work email")]
    [InlineData("Name", "Org", "", "valid work email")]
    public async Task RequestQuote_WithMissingFields_ReturnsFailure(string name, string org, string email, string expectedError)
    {
        var handler = new RequestQuoteCommandHandler(NullLogger<RequestQuoteCommandHandler>.Instance);
        var command = new RequestQuoteCommand
        {
            ContactName = name,
            OrganizationName = org,
            Email = email
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Contains(expectedError, result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SubscribeNewsletter_WithValidEmail_ReturnsSuccess()
    {
        var handler = new SubscribeNewsletterCommandHandler(NullLogger<SubscribeNewsletterCommandHandler>.Instance);
        var command = new SubscribeNewsletterCommand { Email = "subscriber@domain.com" };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.Succeeded);
        Assert.True(result.Data);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("notanemail")]
    [InlineData("@missinguser.com")]
    public async Task SubscribeNewsletter_WithInvalidEmail_ReturnsFailure(string email)
    {
        var handler = new SubscribeNewsletterCommandHandler(NullLogger<SubscribeNewsletterCommandHandler>.Instance);
        var command = new SubscribeNewsletterCommand { Email = email };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Contains("valid email", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ScheduleDemo_WithValidData_ReturnsSuccessWithDemoCode()
    {
        var handler = new ScheduleDemoCommandHandler(NullLogger<ScheduleDemoCommandHandler>.Instance);
        var command = new ScheduleDemoCommand
        {
            ContactName = "Alex Rivera",
            Email = "alex@city.gov",
            OrganizationName = "City Government of Cagayan",
            PreferredDate = "2026-10-15",
            PreferredTimeSlot = "Morning (9:00 AM - 12:00 PM)",
            TopicsOfInterest = ["Procurement", "Budgeting"]
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data);
        Assert.StartsWith("DEMO-", result.Data.ReferenceCode);
        Assert.Equal("Alex Rivera", result.Data.ContactName);
        Assert.Equal("2026-10-15", result.Data.PreferredDate);
    }

    [Fact]
    public async Task ScheduleDemo_WithMissingRequiredFields_ReturnsFailure()
    {
        var handler = new ScheduleDemoCommandHandler(NullLogger<ScheduleDemoCommandHandler>.Instance);
        var command = new ScheduleDemoCommand
        {
            ContactName = "",
            Email = "invalid",
            OrganizationName = ""
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.Succeeded);
    }
}
