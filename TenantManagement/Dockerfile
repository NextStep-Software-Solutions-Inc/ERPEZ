# Use the official .NET 9.0 SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["ERPEZ.TenantManagement.Api/ERPEZ.TenantManagement.Api.csproj", "ERPEZ.TenantManagement.Api/"]
COPY ["ERPEZ.TenantManagement.Application/ERPEZ.TenantManagement.Application.csproj", "ERPEZ.TenantManagement.Application/"]
COPY ["ERPEZ.TenantManagement.Domain/ERPEZ.TenantManagement.Domain.csproj", "ERPEZ.TenantManagement.Domain/"]
COPY ["ERPEZ.TenantManagement.Infrastructure/ERPEZ.TenantManagement.Infrastructure.csproj", "ERPEZ.TenantManagement.Infrastructure/"]

RUN dotnet restore "ERPEZ.TenantManagement.Api/ERPEZ.TenantManagement.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/ERPEZ.TenantManagement.Api"
RUN dotnet build "ERPEZ.TenantManagement.Api.csproj" -c Release -o /app/build

# Publish the application
RUN dotnet publish "ERPEZ.TenantManagement.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose ports
EXPOSE 80
EXPOSE 443

# Set the entry point
ENTRYPOINT ["dotnet", "ERPEZ.TenantManagement.Api.dll"]