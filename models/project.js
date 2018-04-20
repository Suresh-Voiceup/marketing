const mongoose = require('mongoose');
const schema = mongoose.Schema;
const projectSchema = new schema({
    title: String,
    description: String,
    completionPercentage: {
        type: Number,
        default: 0
    },
    startDate: String,
    endDate: String,
    updatedDate: String,
    projectStatus: {
        type: String,
        enum: ['Active', 'Completed'],
        default: 'Active'
    },
    takeAways: [{
        title: String,
        status: {
            type: String,
            enum: ['onTrack', 'offTrack', 'needAttention'],
            default: 'onTrack'
        }
    }],
    serviceLiniked: [String],
    projectType: {
        type: String
     
    },
    people:[{
        userId:{
          type: String
         },
        userName:String,
        userEmail:String
        
    }],
    health: {
        quality: {
            type: String,
            enum: ['onTrack', 'offTrack', 'needAttention'],
            default: 'onTrack'

        },
        scope: {
            type: String,
            enum: ['onTrack', 'offTrack', 'needAttention'],
            default: 'onTrack'

        },
        finance: {
            type: String,
            enum: ['onTrack', 'offTrack', 'needAttention'],
            default: 'onTrack'

        },
        schedule: {
            type: String,
            enum: ['onTrack', 'offTrack', 'needAttention'],
            default: 'onTrack'

        }
    }

})

projectSchema.methods.speak = function () {

}
const projectmodel = mongoose.model('project', projectSchema);
module.exports = projectmodel;