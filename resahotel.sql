SELECT
    hotel.nom,
    chambre.chambre,
    chambre.numero,
    chambre.type,
    chambre.tarif
FROM hotel
JOIN chambre
    ON hotel.hotel = chambre.hotel;