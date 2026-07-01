using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;

namespace VirTrade.Core.Services;

public class MarketSimulator : IMarketSimulator
{
    public Task DemarrerAsync(CancellationToken ct)
    {
        // On implémentera la boucle de tick ici à l'étape suivante (J3)
        throw new NotImplementedException();
    }

    /// <summary>
    /// Génère un nouveau prix réaliste à partir du prix actuel,
    /// en utilisant le mouvement brownien géométrique (Box-Muller).
    /// </summary>
    public decimal GenererPrix(decimal prixActuel, decimal volatilite)
    {
        // 1. Deux nombres aléatoires uniformes entre 0 et 1 (jamais exactement 0)
        double u1 = 1.0 - Random.Shared.NextDouble();
        double u2 = 1.0 - Random.Shared.NextDouble();

        // 2. Transformation de Box-Muller → un choc gaussien (distribution en cloche)
        double gaussien = Math.Sqrt(-2.0 * Math.Log(u1))
                         * Math.Sin(2.0 * Math.PI * u2);

        // 3. dt = un "tick" parmi les minutes de trading annuelles (252 jours x 390 min)
        double dt = 1.0 / (252 * 390);

        // 4. Le choc final = volatilité × racine(dt) × gaussien
        double choc = (double)volatilite * Math.Sqrt(dt) * gaussien;

        // 5. Nouveau prix = prix actuel × exponentielle du choc
        return prixActuel * (decimal)Math.Exp(choc);
    }
}