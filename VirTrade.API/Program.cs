using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using VirTrade.API;
using VirTrade.API.Middlewares;
using VirTrade.Core.Interfaces;
using VirTrade.Core.Services;
using VirTrade.Infrastructure.Notifications;
using VirTrade.Infrastructure.Persistence.Repositories;
using VirTrade.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// === Services ===

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Swagger avec support JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "VirTrade API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Entrer uniquement le token JWT"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

// CORS — autoriser le frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    // Permet à SignalR de recevoir le JWT via query string (section 11)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// SignalR + Notifier (section 11)
builder.Services.AddScoped<ISignalRNotifier, SignalRNotifier>();
builder.Services.AddSignalR();

// Base de données SQLite (section 3 + section 12)
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// TODO : décommenter une fois Membre 1 livré IOrderRepository + IMatchingRepository
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IMatchingRepository, MatchingRepository>();
builder.Services.AddScoped<IOrderBookService, OrderBookService>();
builder.Services.AddScoped<IMatchingEngine, MatchingEngine>();


// === Membre 3 : MarketSimulator (TEMPORAIRE en attendant AppDbContext branché) ===
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddSingleton<IMarketSimulator, MarketSimulator>();
builder.Services.AddHostedService<MarketSimulatorHostedService>();

var app = builder.Build();

// === Pipeline ===

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware global d'erreurs (section 10 — RFC 7807)
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Hub SignalR (section 11 + section 15.11)
app.MapHub<BourseHub>("/hubs/bourse");

app.Run();