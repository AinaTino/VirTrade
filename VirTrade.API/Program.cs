using VirTrade.Core.Interfaces;
using VirTrade.Core.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddControllers();

// TEMPORAIRE - Membre 3 : à remplacer par le vrai StockRepository (Membre 2 / AppDbContext)
builder.Services.AddSingleton<IStockRepository, FakeStockRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();