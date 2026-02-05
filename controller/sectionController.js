const { database } = require('pg/lib/defaults');
const { pgClient } = require('../db/pgClient');

/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getAllSections = async (req, res) => {
    const getSections = "select section_id,visible_name,parent_id from tbl_section;"
    try {
        const { rows } = await pgClient.query(getSections);
        return res.status(200).send({ msg: "All Sections are fetched", data: rows });
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
const addSection = async (req, res) => {
    /** @type {{section_name:String,visible_name:String,section_slug:String,section_desc:String,parent_id:String}} */
    const { section_name, visible_name, section_slug, section_desc, parent_id } = req.body;

    if (!section_name || !visible_name || !section_slug || !section_desc) {
        return res.status(500).send({ msg: "Provide all required fields" });
    }

    const insertQ = "insert into tbl_section(section_name,visible_name,section_slug,section_desc,parent_id) values ($1,$2,$3,$4,$5)";
    try {
        const { rows, rowCount } = await pgClient.query(insertQ, [section_name, visible_name, section_slug, section_desc, parent_id]);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "Error while adding section" });
        } else {
            return res.status(200).send({ msg: "Section added." });
        }
    } catch (error) {
        console.log(error.detail);
        return res.status(500).send({ msg: 'Error: ' + error.detail });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getSectionById = async (req, res) => {
    /** @type {{id:String}} */
    const { id } = req.body;
    if (!id) {
        return res.status(500).send({ msg: "Section ID needed." });
    }
    const getSectionQuery = "select * from tbl_section where section_id=$1;";
    try {
        const { rowCount, rows } = await pgClient.query(getSectionQuery, [id]);
        if (rowCount === 1) {
            return res.status(200).send({ msg: "Section data fetched", data: rows });
        }
        else {
            return res.status(500).send({ msg: "More than 1 row, not returnable." });
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
const getChildBySectionId = async (req, res) => {
    /** @type {{section_id:String}} */
    const { section_id } = req.body;

    const getChildQ = "select section_id,visible_name from tbl_section where parent_id=$1;";
    try {
        const { rowCount, rows } = await pgClient.query(getChildQ, [section_id]);
        return res.status(200).send({ msg: "Child Fetched", data: rows });
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
const setSectionVisible = async (req, res) => {
    /** @type {{section_id:String}} */
    const { section_id } = req.body;
    const makeInactiveQ = 'update tbl_section set is_active=$1 where section_id=$2';
    try {
        const { rowCount } = await pgClient.query(makeInactiveQ, [true, section_id]);

        if (rowCount === 1) {
            return res.status(200).send({ msg: "Section set to visible" });
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
const setSectionInVisible = async (req, res) => {
    /** @type {{section_id:String}} */
    const { section_id } = req.body;
    const makeInactiveQ = 'update tbl_section set is_active=$1 where section_id=$2';
    try {
        const { rowCount } = await pgClient.query(makeInactiveQ, [false, section_id]);

        if (rowCount === 1) {
            return res.status(200).send({ msg: "Section set to invisible" });
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
const updateSection = async (req, res) => {
    /** @type {{section_id:String,section_name:String,visible_name:String,section_icon:String,section_slug:String,section_desc:String,parent_id:String,title:String,meta_desc:String,thumbnail_img:String}} */
    const { section_id, section_name, visible_name, section_icon, section_slug, section_desc, parent_id, title, meta_desc, thumbnail_img } = req.body;

    if (!section_name || !visible_name || !section_slug || !section_desc) {
        return res.status(500).send({ msg: "Provide all required fields" });
    }
    const updateSectionQ = `UPDATE tbl_section
	SET section_name=$1, visible_name=$2, section_icon=$3, section_slug=$4, section_desc=$5, parent_id=$6, title=$7, meta_desc=$8, thumbnail_img=$9, last_modified=NOW()
	WHERE section_id=$10;`;
    try {
        const { rowCount } = await pgClient.query(updateSectionQ, [section_name, visible_name, section_icon, section_slug, section_desc, parent_id, title, meta_desc, thumbnail_img, section_id]);
        if (rowCount === 1) {
            return res.status(200).send({ msg: "Section updated" });
        } else {
            return res.status(500).send({ msg: "Error while section " });
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
const setSectionVisibleOrder = async (req, res) => {
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
const getAllL1Sections = async (req, res) => {

    const getL1 = "select section_id,visible_name,is_active from penpapper_schema.tbl_section order by visible_order;"
    try {
        const { rows, rowCount } = await pgClient.query(getL1);
        return res.status(200).send({ msg: "Fetched visible name by visible order.", data: rows });
    } catch (error) {
        console.log(error.detail);
        return res.status(500).send({ msg: 'Error: ' + error.detail});
    }
}


module.exports = { getAllSections, addSection, getSectionById, getChildBySectionId, setSectionVisible, setSectionInVisible, updateSection, setSectionVisibleOrder, getAllL1Sections }