using VirTrade.Core.Enums;

namespace VirTrade.API.Controllers;

public record PlacerOrdreRequest(
    string Symbole,
    TypeOrdre TypeOrdre,
    SensOrdre SensOrdre,
    int Quantite,
    decimal? PrixLimite,
    DateTime? ExpiresAt
);