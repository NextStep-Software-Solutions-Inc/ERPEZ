using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Sieve;
using ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPs;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using Sieve.Models;
using Sieve.Services;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.WFPQueries;

public class GetWFPsQueryHandlerTests
{
    private readonly ApplicationSieveProcessor sieveProcessor;

    public GetWFPsQueryHandlerTests()
    {
        var sieveOptions = Options.Create(new SieveOptions());
        sieveProcessor = new ApplicationSieveProcessor(sieveOptions);
    }

    [Fact]
    public void ApplicationSieveProcessor_FilteringWFPByOfficeIdFiscalYearAndStatus_ShouldFilterCorrectly()
    {
        // Arrange
        var targetOfficeId = Guid.Parse("2ae45585-fbaf-4b50-b17c-954f8fc3712f");
        var otherOfficeId = Guid.NewGuid();

        var wfpList = new List<WFP>
        {
            // Matching WFP: target office, FY 2026, Approved
            new WFP
            {
                Id = Guid.NewGuid(),
                OfficeId = targetOfficeId,
                ProjectTitle = "WFP 2026 Approved",
                ProjectStartDate = new DateOnly(2026, 1, 1),
                ProjectEndDate = new DateOnly(2026, 12, 31),
                Status = StatusEnum.Approved,
                Office = new Office { Name = "Office A" }
            },
            // Non-matching: different fiscal year (2025)
            new WFP
            {
                Id = Guid.NewGuid(),
                OfficeId = targetOfficeId,
                ProjectTitle = "WFP 2025 Approved",
                ProjectStartDate = new DateOnly(2025, 1, 1),
                ProjectEndDate = new DateOnly(2025, 12, 31),
                Status = StatusEnum.Approved,
                Office = new Office { Name = "Office A" }
            },
            // Non-matching: different status (Draft)
            new WFP
            {
                Id = Guid.NewGuid(),
                OfficeId = targetOfficeId,
                ProjectTitle = "WFP 2026 Draft",
                ProjectStartDate = new DateOnly(2026, 1, 1),
                ProjectEndDate = new DateOnly(2026, 12, 31),
                Status = StatusEnum.Draft,
                Office = new Office { Name = "Office A" }
            },
            // Non-matching: different office
            new WFP
            {
                Id = Guid.NewGuid(),
                OfficeId = otherOfficeId,
                ProjectTitle = "WFP 2026 Other Office",
                ProjectStartDate = new DateOnly(2026, 1, 1),
                ProjectEndDate = new DateOnly(2026, 12, 31),
                Status = StatusEnum.Approved,
                Office = new Office { Name = "Office B" }
            }
        }.AsQueryable();

        var sieveModel = new SieveModel
        {
            Filters = $"officeId=={targetOfficeId},fiscalYear==2026,status==Approved"
        };

        // Act
        var filteredQuery = sieveProcessor.Apply(sieveModel, wfpList);
        var result = filteredQuery.ToList();

        // Assert
        result.Should().HaveCount(1);
        result[0].ProjectTitle.Should().Be("WFP 2026 Approved");
        result[0].OfficeId.Should().Be(targetOfficeId);
        result[0].ProjectStartDate.Year.Should().Be(2026);
        result[0].Status.Should().Be(StatusEnum.Approved);
    }
}
