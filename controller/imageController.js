const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { configDotenv } = require('dotenv');
const { createAdminLog } = require('../utils/logWriter');
const { pgClient } = require('../db/pgClient');

configDotenv();
const S3_BUCKET = process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION;
const s3 = new S3Client({ region: REGION });

/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getImagePresingedUrl = async (req, res) => {
    const { fileExt } = req.body;
    const unqSuffix = Date.now();
    const unqPrefix = Math.ceil(Math.random() * 1e7);
    const fileName = `${unqSuffix}_${unqPrefix}.${fileExt}`;
    const object_key = `${process.env.S3_ROOT_DIR}/images/${fileName}`;
    try {
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: object_key,
        });
        const uploadUrl = await getSignedUrl(s3, command, {
            expiresIn: 60 * 5 // 5 min
        });
        createAdminLog(`PRESINGED URL GENERATED FOR '${object_key}'`, 'SYSTEM_USER');
        return res.status(200).send({ url: uploadUrl, filepath: object_key });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error, url: null });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const saveImageDataToDb = async (req, res) => {
    /** @type {{file_name:String,file_path:String,mime_type:String,file_size:Number,created_by:String}} */
    const { file_name, file_path, file_size, mime_type, created_by } = req.body;
    const insertQ = "insert into tbl_image(file_name,file_path,mime_type,file_size,created_by) values($1,$2,$3,$4,$5) returning media_id;";
    try {
        const { rowCount, rows } = await pgClient.query(insertQ, [file_name, file_path, mime_type, file_size, created_by])
        if (rowCount === 1) {
            createAdminLog(`IMAGE DATA SAVED MEDIA ID: ${rows[0]['media_id']}`, "SYSTEM_USER");
            return res.status(200).send({ msg: "Image uploaded.",url:file_path });
        } else {
            return res.status(500).send({ msg: "Server Error" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getImages = async (req, res) => {
    /** @type {{parameter:Datatype}} */
    const { parameter } = req.body;
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}



/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getImageUrls = async (req, res) => {
    const { lastId } = req.body; // null for first load
    const limit = 20;

    try {
        let query;
        let params;

        if (lastId) {
            query = `
                SELECT media_id,file_path
                FROM tbl_image
                WHERE media_id < $1
                ORDER BY media_id DESC
                LIMIT $2
            `;
            params = [lastId, limit];
        } else {
            query = `
                SELECT media_id,file_path
                FROM tbl_image
                ORDER BY media_id DESC
                LIMIT $1
            `;
            params = [limit];
        }

        const {rows} = await pgClient.query(query, params);

        return res.status(200).json({
            success: true,
            images: rows.map(r => `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${r.file_path}`),
            nextCursor: rows.length ? rows[rows.length - 1].id : null,
            hasMore: rows.length === limit
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { getImagePresingedUrl, saveImageDataToDb,getImageUrls }