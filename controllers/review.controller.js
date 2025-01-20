const addReview = async (req, res) => {
  const { id: orderId } = req.params;
  const { star, desc } = req.body; 

  try {
     const order = await prisma.order.findUnique({
       where: {
         id: parseInt(orderId), 
       },
       include: {
         car: {
           select: {
             id: true,
           }
         }, 
       },
     });
    
    const existingReview = await prisma.review.findFirst({
      where: {
        buyerId: req.userId,
        carId : order.car.id,
      },
    });
    if (existingReview)
      return res
        .status(400)
        .json({ message: "You have already reviewed this car!." });

    const review = await prisma.review.create({
      data: {
        carId: order.car.id,
        star,
        desc,
        buyerId: req.userId,
      },
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to add review.", error });
  }
};

const getCarReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: {
        carId: parseInt(id),
      },
      include: {
        buyer: {
          select: {
            username: true,
          },
        },
      },
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
};
export { addReview, getCarReviews };