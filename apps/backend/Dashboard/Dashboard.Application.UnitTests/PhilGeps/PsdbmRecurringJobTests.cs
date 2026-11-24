using ERPEZ.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace ERPEZ.Application.UnitTests.PhilGeps;

public class PsdbmRecurringJobTests
{
    [Fact]
    public void GetPhilippineTimeZone_ShouldReturnValidTimeZone()
    {
        // Act
        var tz = PsdbmRecurringJobExtensions.GetPhilippineTimeZone();

        // Assert
        tz.Should().NotBeNull();
        (tz.Id == "Asia/Manila" || tz.Id == "Singapore Standard Time" || tz.BaseUtcOffset.TotalHours == 8).Should().BeTrue();
    }

    [Fact]
    public void JobConstants_ShouldBeDefinedProperly()
    {
        PsdbmRecurringJobExtensions.fullCatalogueSyncJobId.Should().Be("psdbm-full-catalogue-sync");
        PsdbmRecurringJobExtensions.stockSyncJobId.Should().Be("psdbm-stock-sync");
    }
}
