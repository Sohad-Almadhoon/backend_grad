import prisma from "../utils/db.js";

const addReview = async (req, res) => {
  const { star, desc, carId } = req.body;
  console.log(req.body, req.userId);
  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        buyerId: req.userId,
        carId,
      },
    });
    if (existingReview)
      return res
        .status(400)
        .json({ message: "You have already reviewed this car!." });

    const review = await prisma.review.create({
      data: {
        carId,
        star,
        desc,
        buyerId: req.userId,
      },
    });
    res.status(201).json(review);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Failed to add review.", error:error.message });
  }
};

export { addReview };
