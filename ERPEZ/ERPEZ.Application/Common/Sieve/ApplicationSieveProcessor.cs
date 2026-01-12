using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Common.Sieve;

public class ApplicationSieveProcessor(IOptions<SieveOptions> options) : SieveProcessor(options)
{
    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper = base.MapProperties(mapper);
        
        // Instantiate configuration directly since this is called during base constructor
        // before any instance fields are initialized
        var configuration = new PlanningSieveConfiguration();
        configuration.Configure(mapper);
        
        return mapper;
    }
}
