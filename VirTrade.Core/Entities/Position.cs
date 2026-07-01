using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirTrade.Core.Entities;

public class Position
{
    [Key]
    public int Id { get; set; }

    public int QuantiteDetenue { get; set; } = 0;

    [Column(TypeName = "decimal(18,4)")]
    public decimal PrixMoyenAchat { get; set; } = 0;

    [Required]
    public int PortefeuilleId { get; set; }

    public Portefeuille Portefeuille { get; set; }

    [Required]
    public int StockId { get; set; }

    public Stock Stock { get; set; }

    // -----------------------------------------------------------------------
    // Méthodes métier
    // -----------------------------------------------------------------------

    /// <summary>
    /// PnL de la position = (PrixActuel - PrixMoyenAchat) × QuantiteDetenue
    /// </summary>
    public decimal CalculerPnLPosition()
        => (Stock.PrixActuel - PrixMoyenAchat) * QuantiteDetenue;

    /// <summary>
    /// Mise à jour du prix moyen pondéré après un achat.
    /// Formule doc section 1.5 :
    /// PrixMoyen = (QteActuelle × PrixMoyenActuel + NouvelleQte × NouveauPrix)
    ///             / (QteActuelle + NouvelleQte)
    /// </summary>
    public void MettreAJour(int qte, decimal prix)
    {
        var nouvelleQte = QuantiteDetenue + qte;

        PrixMoyenAchat = nouvelleQte == 0
            ? 0
            : (QuantiteDetenue * PrixMoyenAchat + qte * prix) / nouvelleQte;

        QuantiteDetenue = nouvelleQte;
    }
}