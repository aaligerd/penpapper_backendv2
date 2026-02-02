const express=require('express');
const { addAuthor, updateAuthorBioPic, getAuthorBioPicPresingedUrl, makeAuthorInactive, getAllAuthor, getActiveAuthor, getAuthorById, updateAuthorById } = require('../controller/authorController');
const authorRouter=express.Router();


authorRouter.get('/',getAllAuthor);
authorRouter.get('/get/active',getActiveAuthor);
authorRouter.post('/get/byid',getAuthorById);
authorRouter.put('/update/byid',updateAuthorById);
authorRouter.post('/add',addAuthor);
authorRouter.post('/biopic/get-presinged-url',getAuthorBioPicPresingedUrl);
authorRouter.post('/update-pic',updateAuthorBioPic);
authorRouter.post('/make-inactive',makeAuthorInactive);


module.exports= authorRouter;