var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;
milestoneSchema = new Schema({
    status: {
        type: String,
        enum: ["inProgress", "completed", "upcoming"],
        default: "inProgress"
    },
    startDate: String,
    endDate: String,
    title: String,
    description: String,
    projectId: ObjectId,
    review: [{
        rating: Number,
        comment: String,
        givenBy: String
    }]
})
var milestone = mongoose.model('milestone', milestoneSchema)
module.exports = milestone;