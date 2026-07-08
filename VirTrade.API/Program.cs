using VirTrade.API;
using VirTrade.Core.Interfaces;
using VirTrade.Core.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// TEMPORAIRE - Membre 3 : à remplacer par le vrai StockRepository (Membre 2 / AppDbContext)
builder.Services.AddSingleton<IStockRepository, FakeStockRepository>();
builder.Services.AddSingleton<IMarketSimulator, MarketSimulator>();
builder.Services.AddHostedService<MarketSimulatorHostedService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();