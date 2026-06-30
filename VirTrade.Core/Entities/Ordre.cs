using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using VirTrade.Core.Enums;

namespace VirTrade.Core.Entities;

public class Ordre
{
    [Key]
    public int Id { get; set; }

    [Required]
    public required BookType Type { get; set; }

    [Required]
    public required Sens Sens { get; set; }

    [Required]
    public int Quantite { get; set; }

    public int QuantiteExecutee { get; set; } = 0;

    [Column(TypeName = "decimal(18,4)")]
    public decimal? PrixLimite { get; set; }

    [Required, MaxLength(20)]
    public string Statut { get; set; } = "OPEN";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiresAt { get; set; }

    [Required]
    public int UtilisateurId { get; set; }

    public required Utilisateur Utilisateur { get; set; }

    [Required]
    public int StockId { get; set; }

    public Stock Stock { get; set; }

    public ICollection<Trade> BuyTrades { get; set; } = new List<Trade>();
    public ICollection<Trade> SellTrades { get; set; } = new List<Trade>();
}