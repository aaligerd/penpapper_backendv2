const express=require('express');
const { getAllSections, addSection, getSectionById, getChildBySectionId, setSectionVisible, setSectionInVisible, updateSection, setSectionVisibleOrder, getAllL1Sections } = require('../controller/sectionController');
const sectionRouter=express.Router();


sectionRouter.get('/',getAllSections);
sectionRouter.get('/l1',getAllL1Sections);
sectionRouter.post('/add',addSection);
sectionRouter.post('/update',updateSection);
sectionRouter.post('/get/single',getSectionById);
sectionRouter.post('/get/child',getChildBySectionId);
sectionRouter.post('/move/child',getChildBySectionId);
sectionRouter.post('/makevisible',setSectionVisible);
sectionRouter.post('/makeinvisible',setSectionInVisible);
sectionRouter.post('/set/visible/order',setSectionVisibleOrder);// incomplete

module.exports= sectionRouter;