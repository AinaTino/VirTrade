using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirTrade.Core.Entities;

public class Portefeuille
{
    [Key]
    public int Id { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal SoldeCash { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public int UtilisateurId { get; set; }

    public required Utilisateur Utilisateur { get; set; }

    public ICollection<Position> Positions { get; set; } = new List<Position>();

    // -----------------------------------------------------------------------
    // Méthodes métier
    // -----------------------------------------------------------------------

    /// <summary>
    /// Valeur totale = SoldeCash + somme(PrixActuel × QuantiteDetenue) par position
    /// </summary>
    public decimal CalculerValeurTotale()
        => SoldeCash + Positions.Sum(p => p.Stock.PrixActuel * p.QuantiteDetenue);

    /// <summary>
    /// PnL = Valeur actuelle - Capital initial
    /// PnL% = (PnL / Capital initial) × 100
    /// Formule doc section 1.5
    /// </summary>
    public decimal CalculerPnL(decimal capitalInitial)
        => CalculerValeurTotale() - capitalInitial;

    public decimal CalculerPnLPourcentage(decimal capitalInitial)
        => capitalInitial == 0
            ? 0
            : (CalculerPnL(capitalInitial) / capitalInitial) * 100;
}