const addFavorite = async (req, res) => {
  const { carId } = req.body;
  try {
    const favorite = await prisma.favorite.create({
      data: {
        carId,
        buyerId: req.userId,
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to favorites.", error });
  }
};
const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { buyerId: req.userId },
      include: {
        car: {
          select: {
            coverImage: true,
            price: true,
            brand: true,
          },
        },
      },
    });

    res.status(200).json({
      length: favorites.length,
      favorites,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch favorites." });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.favorite.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).json({ message: "Favorite removed." });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from favorites." });
  }
};
export { addFavorite, getFavorites, removeFavorite };