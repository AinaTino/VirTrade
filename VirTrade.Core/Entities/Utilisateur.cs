using System.ComponentModel.DataAnnotations;
using VirTrade.Core.Enums;

namespace VirTrade.Core.Entities;

public class Utilisateur
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string Nom { get; set; }

    [Required, MaxLength(255)]
    public required string Email { get; set; }

    [Required]
    public required string PasswordHash { get; set; }

    public Role Role { get; set; } = Role.Trader;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portefeuille? Portefeuille { get; set; }

    public ICollection<Ordre> Ordres { get; set; } = new List<Ordre>();
}