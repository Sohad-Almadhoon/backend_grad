import prisma from "../utils/db.js";
import AppError from "../utils/AppError.js";

const addFavorite = async (req, res, next) => {
  const { carId } = req.body;
  try {
    await prisma.favorite.create({
      data: {
        carId,
        buyerId: req.userId,
      },
    });

    res.status(201).json("Added to favorites successfully!");
  } catch (error) {
    next(new AppError("Failed to add to favorites.", 500, error.message));
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { buyerId: req.userId },
      include: {
        car: {
          include: {
            seller: {
              select: {
                username: true,
                whatsapp: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      length: favorites.length,
      favorites,
    });
  } catch (error) {
    next(new AppError("Failed to fetch favorites.", 500, error.message));
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const favorite = await prisma.favorite.findUnique({
      where: { id: parseInt(id) },
    });

    if (!favorite) {
      return next(new AppError("Favorite not found.", 404));
    }

    await prisma.favorite.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).json({ message: "Favorite removed." });
  } catch (error) {
    next(new AppError("Failed to remove from favorites.", 500, error.message));
  }
};

export { addFavorite, getFavorites, removeFavorite };
