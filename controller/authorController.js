const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { pgClient } = require('../db/pgClient');
const { createAdminLog } = require('../utils/logWriter');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { configDotenv } = require('dotenv');


configDotenv();
const S3_BUCKET = process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION;
const s3 = new S3Client({ region: REGION });


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const addAuthor = async (req, res) => {
    /** @type {{author_name:String,email:String,bio:String,social:Array<String>,unq_slug:String,org_code:String,user_code:String}} */
    let { author_name, email, bio, social, unq_slug, org_code, user_code } = req.body;
    if (!author_name || author_name.trim() === "" || !email || email.trim() === "" || !unq_slug || unq_slug.trim() === "" || !org_code || org_code.trim() === "") {
        return res.status(500).send({ msg: "Please provide mandetory field information" });
    }
    const insertQ = "insert into tbl_author(org_code,author_name,email,author_bio,social_links,author_slug) values ($1,$2,$3,$4,$5,$6)";
    social = social && social.length >= 1 ? social.join(",") : null;
    try {
        const { rowCount } = await pgClient.query(insertQ, [org_code, author_name, email, bio || "", social, unq_slug]);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "There is an error while inserting new author data." });
        } else {
            createAdminLog('NEW AUTHOR CREATED', user_code);
            return res.status(200).send({ msg: "New author created" });
        }
    } catch (error) {
        
        return res.status(500).send({ msg: 'Error: ' + error.detail });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const updateAuthorBioPic = async (req, res) => {
    /** @type {{author_pic:String,author_id:String}} */
    const { author_pic, author_id } = req.body;
    const updatePic = 'update tbl_author set bio_pic_link=$1 where id=$2;';
    try {
        const { rows, rowCount } = await pgClient.query(updatePic, [author_pic, author_id]);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "Data not updated." });
        } else {
            return res.status(200).send({ msg: "Author bio pic updated." });
        }
    } catch (error) {
        
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getAuthorBioPicPresingedUrl = async (req, res) => {
    /** @type {{fileExt:String}} */
    const { fileExt } = req.body;
    const unqSuffix = Date.now();
    const unqPrefix = Math.ceil(Math.random() * 1e7);
    const fileName = `${unqSuffix}_${unqPrefix}.${fileExt}`;
    const object_key = `${process.env.S3_ROOT_DIR}/author/${fileName}`;
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
        
        return res.status(500).send({ msg: 'Error: ' + error, url: null });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const makeAuthorInactive = async (req, res) => {
    /** @type {{author_id:String}} */
    const { author_id } = req.body;
    const updateStatus = 'update tbl_author set is_active=$1 where id=$2;';
    try {
        const { rowCount, rows } = await pgClient.query(updateStatus, [false, author_id]);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "Author status is not updated." });
        } else {
            return res.status(200).send({ msg: "Auther status updated" });
        }
    } catch (error) {
        
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getAllAuthor = async (req, res) => {
    const getAuthorQ = 'select id,org_code,author_name from tbl_author order by created_at desc;';
    try {
        const { rowCount, rows } = await pgClient.query(getAuthorQ);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "No data", data: [] });
        } else {
            return res.status(200).send({ msg: "Data fetched.", data: rows });
        }
    } catch (error) {
        
        return res.status(500).send({ msg: 'Error: ' + error });
    }


}
/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getActiveAuthor = async (req, res) => {
    const getActiveAuthorQ = 'select id,org_code,author_name from tbl_author where is_active=true order by created_at desc;';
    try {
        const { rowCount, rows } = await pgClient.query(getActiveAuthorQ);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "No data", data: [] });
        } else {
            return res.status(200).send({ msg: "Data fetched.", data: rows });
        }
    } catch (error) {
        
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getAuthorById = async (req, res) => {
    /** @type {{author_id:String}} */
    const { author_id } = req.body;
    const getAuthorByIdQ = "select * tbl_author where id=$1;";
    try {
        const { rowCount, rows } = await pgClient.query(getAuthorByIdQ, [author_id]);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "Author not available.", data: [] });
        } else {
            return res.status(200).send({ msg: "Author data available.", data: rows });
        }
    } catch (error) {
        
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const updateAuthorById = async (req, res) => {
    /** @type {{author_id:String,author_name:String,email:String,author_bio:String,social:Array<String>,is_active:boolean,author_slug:String,}} */
    const { author_id, author_name, email, author_bio = "", social, author_slug } = req.body;
    if (!author_id || author_id.trim() === "" || !author_name || author_name.trim() === "" || !email || email.trim() === "" || !author_slug || author_slug.trim() === "") {
        return res.status(500).send({ msg: "Please provide mandetory fields." });
    }
    let social_links = social && social.length >= 1 ? social.join(',') : null;
    const updateAuthorQ = 'update tbl_author set author_name=$1,email=$2,author_bio=$3,social_links=$4,author_slug=$5,last_mod_at=NOW() where id=$6;';

    try {
        const { rowCount } = await pgClient.query(updateAuthorQ, [author_name, email, author_bio, social_links, author_slug, author_id]);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "Author data not updated." });
        } else {
            return res.status(200).send({ msg: "Author data updated." });
        }
    } catch (error) {
        
        return res.status(500).send({ msg: 'Error: ' + error.detail });
    }
}



module.exports = { addAuthor, updateAuthorBioPic, getAuthorBioPicPresingedUrl, makeAuthorInactive, getAllAuthor, getActiveAuthor, getAuthorById, updateAuthorById }