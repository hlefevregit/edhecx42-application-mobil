const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFridgeItems = async (req, res) => {
  const { userId } = req.params;

  try {
    const items = await prisma.fridgeItem.findMany({
      where: { userId },
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve fridge items' });
  }
};

exports.addFridgeItems = async (req, res) => {
  const { userId } = req.params;
  const { items } = req.body;

  try {
    const createdItems = await prisma.fridgeItem.createMany({
      data: items.map(item => ({
        ...item,
        userId,
      })),
    });
    res.status(201).json(createdItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add fridge items' });
  }
};

exports.updateFridgeItem = async (req, res) => {
  const { itemId } = req.params;
  const updateData = req.body;

  try {
    const updatedItem = await prisma.fridgeItem.update({
      where: { id: itemId },
      data: updateData,
    });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update fridge item' });
  }
};

exports.deleteFridgeItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    await prisma.fridgeItem.delete({
      where: { id: itemId },
    });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete fridge item' });
  }
};