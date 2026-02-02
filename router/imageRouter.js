const express=require('express');
const { getImagePresingedUrl, saveImageDataToDb,getImageUrls } = require('../controller/imageController');
const imageRouter=express.Router();


imageRouter.post('/img',getImageUrls);
imageRouter.post('/img/get/presingedurl',getImagePresingedUrl);
imageRouter.post('/img/save',saveImageDataToDb)


module.exports= imageRouter;