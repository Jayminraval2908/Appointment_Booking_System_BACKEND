const userSchema = require('../models/Users');

const getPendingPsychologists = async(req , res) =>{
    try {
        
        const psychologist = await userSchema.find({
            role:"psychologist",
            isApproved:false,
            specialization:{
                $exists:true,
                $ne:null
            }

        }).select("-password")

        return res.status(200).json({
            count:psychologist.length,
            data:psychologist
        })


    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}


const approvePsychologist = async(req,res)=>{
    try {

        const psychologist = await userSchema.findById(req.params.id);

        if (!psychologist) {
            return res.status(404).json({
                message:"Psychologist not found"
            });
        }

        psychologist.isApproved = true;
        await psychologist.save();

        return  res.status(200).json({
            message:"Psychologist approved successfully"
        });
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const getDashboardStats = async (req, res) => {
  try {

    const totalPatients = await userSchema.countDocuments({
      role: "patient",
    });

    const totalPsychologists =
      await userSchema.countDocuments({
        role: "psychologist",
        isApproved: true,
      });

    const pendingApprovals =
      await userSchema.countDocuments({
        role: "psychologist",
        isApproved: false,
      });

    res.status(200).json({
      totalPatients,
      totalPsychologists,
      pendingApprovals,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    }); 
  }
};



module.exports = { getPendingPsychologists , approvePsychologist , getDashboardStats }