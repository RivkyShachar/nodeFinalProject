const express = require("express");
const { auth, authAdmin } = require("../middlewares/auth");
const { TablesModel, validateTable } = require("../models/tableModel")
const router = express.Router();

router.get("/", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 20) || 4;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await TablesModel
            .find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
        res.status(201).json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }

})

// /search?s=
router.get("/search", async (req, res) => {
    try {
        let queryS = req.query.s;
        // cancle the case senstive
        let searchReg = new RegExp(queryS, "i")
        let data = await TablesModel.find({ name: searchReg })
            .limit(50)
        res.status(201).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there is an error try again later", err })
    }
})

router.post("/", auth, async (req, res) => {
    let validBody = validateTable(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let table = new TablesModel(req.body);
        // add the user_id of the user that add the table
        table.user_id = req.tokenData._id;
        await table.save();
        res.status(201).json(table);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

router.put("/:editId", auth, async (req, res) => {
    let validBody = validateTable(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let editId = req.params.editId;
        let data;
        if (req.tokenData.role == "admin") {
            data = await TablesModel.updateOne({ _id: editId }, req.body)
        }
        else {
            data = await TablesModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
        }
        res.status(201).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

router.delete("/:delId", auth, async (req, res) => {
    try {
        let delId = req.params.delId;
        let data;
        if (req.tokenData.role == "admin") {
            data = await TablesModel.deleteOne({ _id: delId })
        }
        else {
            data = await TablesModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
        }
        res.status(201).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

module.exports = router;