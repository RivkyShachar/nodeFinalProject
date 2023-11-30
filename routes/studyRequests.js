const express = require("express");
const { auth, authAdmin } = require("../middlewares/auth");
const { StudyRequestModel, validateStudyRequest } = require("../models/studyRequestModel")
const router = express.Router();

router.get("/requestsList", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 20) || 4;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await StudyRequestModel
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
        let data = await StudyRequestModel.find({ topics: { $in: [searchReg] } })
            .limit(50)
        res.status(201).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there is an error try again later", err })
    }
})

router.post("/", auth, async (req, res) => {
    let validBody = validateStudyRequest(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let studyRequest = new StudyRequestModel(req.body);
        // add the user_id of the user that add the studyRequest
        studyRequest.user_id = req.tokenData._id;
        await studyRequest.save();
        res.status(201).json(studyRequest);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

router.put("/:editId", auth, async (req, res) => {
    let validBody = validateStudyRequest(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let editId = req.params.editId;
        let data;
        if (req.tokenData.role == "admin") {
            data = await StudyRequestModel.updateOne({ _id: editId }, req.body)
        }
        else {
            data = await StudyRequestModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
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
            data = await StudyRequestModel.deleteOne({ _id: delId })
        }
        else {
            data = await StudyRequestModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
        }
        res.status(201).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

module.exports = router;