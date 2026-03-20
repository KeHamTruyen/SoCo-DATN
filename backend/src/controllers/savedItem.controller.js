import * as savedItemService from '../services/savedItem.service.js';

export const listSavedItems = async (req, res) => {
  try {
    const { data, pagination } = await savedItemService.listSavedItems(req.user.id, req.query);
    res.json({ success: true, data, pagination });
  } catch (error) {
    console.error('List saved items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list saved items',
      error: error.message,
    });
  }
};

export const addSavedItem = async (req, res) => {
  try {
    const { saved, created } = await savedItemService.addSavedItem(req.user.id, req.body);
    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Saved' : 'Already saved',
      data: { id: saved.id, itemType: saved.itemType, targetId: saved.targetId, createdAt: saved.createdAt },
    });
  } catch (error) {
    const code = error.statusCode || 500;
    if (code === 400 || code === 404) {
      return res.status(code).json({ success: false, message: error.message });
    }
    console.error('Add saved item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save item',
      error: error.message,
    });
  }
};

export const removeSavedItem = async (req, res) => {
  try {
    const result = await savedItemService.removeSavedItem(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error('Remove saved item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved item',
      error: error.message,
    });
  }
};

export const lookupSavedItem = async (req, res) => {
  try {
    const data = await savedItemService.lookupSavedItem(
      req.user.id,
      req.query.itemType,
      req.query.targetId,
    );
    res.json({ success: true, data });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Lookup saved item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lookup saved item',
      error: error.message,
    });
  }
};
