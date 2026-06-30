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
}