using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Common.Sieve;

public class ApplicationSieveProcessor : SieveProcessor
{
    public ApplicationSieveProcessor(
        IOptions<SieveOptions> options,
        ISieveConfiguration sieveConfiguration)
        : base(options)
    {
        sieveConfiguration.Configure(new SievePropertyMapper());
    }
}
