const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFridgeItems = async (req, res) => {
  const { userId } = req.params;

  try {
    console.log(`✅ GET /api/fridge/${userId}`);
    
    const items = await prisma.fridgeItem.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' }
    });
    
    console.log(`✅ Found ${items.length} items`);
    res.status(200).json(items);
  } catch (error) {
    console.error('❌ Error in getFridgeItems:', error.message);
    res.status(500).json({ 
      error: 'Failed to retrieve fridge items',
      details: error.message 
    });
  }
};

exports.addFridgeItems = async (req, res) => {
  const { userId } = req.params;
  const { items } = req.body;

  try {
    console.log(`\n📦 POST /api/fridge/${userId}`);
    console.log(`📦 Adding ${items?.length || 0} items`);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // ✅ Vérifier si l'utilisateur existe, sinon le créer
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log(`⚠️ User ${userId} not found, creating...`);
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `user_${userId}@temp.com`,
          displayName: 'Temporary User'
        }
      });
      console.log(`✅ User created: ${user.id}`);
    }

    const createdItems = [];
    
    for (const item of items) {
      const created = await prisma.fridgeItem.create({
        data: {
          userId,
          name: item.name,
          quantity: item.quantity || 1,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          zone: item.zone || null,
          category: item.category || null,
        },
      });
      createdItems.push(created);
    }

    console.log(`✅ Successfully created ${createdItems.length} items`);
    res.status(201).json(createdItems);
  } catch (error) {
    console.error('❌ Error in addFridgeItems:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Failed to add fridge items',
      details: error.message 
    });
  }
};

exports.updateFridgeItem = async (req, res) => {
  const { itemId } = req.params;
  const updateData = req.body;

  try {
    console.log(`✏️ PUT /api/fridge/${itemId}`, updateData);

    const dataToUpdate = {};
    
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.quantity !== undefined) dataToUpdate.quantity = parseInt(updateData.quantity);
    if (updateData.expiryDate !== undefined) {
      dataToUpdate.expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : null;
    }
    if (updateData.zone !== undefined) dataToUpdate.zone = updateData.zone;
    if (updateData.category !== undefined) dataToUpdate.category = updateData.category;

    const updatedItem = await prisma.fridgeItem.update({
      where: { id: itemId },
      data: dataToUpdate,
    });
    
    console.log('✅ Item updated');
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('❌ Error in updateFridgeItem:', error.message);
    res.status(500).json({ 
      error: 'Failed to update fridge item',
      details: error.message 
    });
  }
};

exports.deleteFridgeItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    console.log(`🗑️ DELETE /api/fridge/${itemId}`);
    
    await prisma.fridgeItem.delete({
      where: { id: itemId },
    });
    
    console.log('✅ Item deleted');
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteFridgeItem:', error.message);
    res.status(500).json({ 
      error: 'Failed to delete fridge item',
      details: error.message 
    });
  }
};