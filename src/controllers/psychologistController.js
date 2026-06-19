const userSchema = require('../models/Users');

const createProfile = async(req,res)=>{
   try {

     const {
        
        city,
        specialization,
        experience,
        license
    } = req.body;

    const psychologist = await userSchema.findById(req.user.userId);

    if (!psychologist) {
        return res.status(404).json({
            message:"User not found"
        })
    }

    if (psychologist.role !== "psychologist") {
        return res.status(403).json({
            message:"Access denied.Only psychologist can create profile"
        });
    }

    if(psychologist.specialization || psychologist.license){
        return res.status(400).json({
            message:"Profile already exists. use update profile instead."
        })
    }

    if (!city || !specialization || !experience || !license) {
        return res.status(400).json({
            message:"City, Specialization, Experience and License are required."
        })
    }

    psychologist.city= city;
    psychologist.specialization= specialization;
    psychologist.experience= experience;
    psychologist.license= license;

    await psychologist.save();

    return res.status(200).json({
        message:"Profile Created Successfully. Waiting for Admin approval.",
        data:   psychologist
    })
    
   } catch (error) {
    return res.status(500).json({
        message:error.message

    });
    
   }

};

const updateProfile = async(req,res)=>{
    try {

        const {
            
            city,
            specialization,
            experience,
            license
        } = req.body;

        const psychologist = await userSchema.findById(req.user.userId);

        if (!psychologist) {
            return res.status(404).json({
                message:"User not found."
            })
        }

        if (psychologist.role !== "psychologist") {
            return res.status(403).json({
                message:"Access denied.Only psychologist can update profile"
            });
        }

        if(!psychologist.specialization || !psychologist.license){
            return res.status(400).json({
                message:"Profile not found. Please create your profile first."
            });
        }

        if (city) {
            psychologist.city=city;
        }

        if (specialization) {
            psychologist.specialization=specialization;
        }

        if (experience) {
            psychologist.experience=experience;
        }

        if (license){
            psychologist.license=license;   
        }

        await psychologist.save();

        return res.status(200).json({
            message:"Profile Updated Successfully",
            data:psychologist
        })


        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const getAllPsychologist = async(req,res)=>{
    try {

        const {city,specialization} = req.query;

        let filter = {
            role:"psychologist",
            isApproved: true
        };

        if(city){
            filter.city=city;
        }

        if(specialization){
            filter.specialization=specialization;
        }

        const psychologist = await userSchema.find(filter).select("-password -googleId");

        return res.status(200).json({
            message:"Approved psychologists fetched successfully",
            count:psychologist.length,
            data:psychologist
        });
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }


}

const getPsychologistById = async(req,res)=>{
    try {

       const psychologist = await userSchema.findOne({
        _id:req.params.id,
        role:"psychologist",
        isApproved:true
       }).select("-password -googleId");

       if (!psychologist) {
        return res.status(404).json({    
            message:"Psychologist not found or not approved yet"
        })
       }

       return res.status(200).json({
        message: "Psychologist fetched successfully",
            data: psychologist,
       })
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const getMyProfile = async (req, res) => {

  try {

    const psychologist =
      await userSchema.findById(
        req.user.userId
      ).select("-password");

    return res.status(200).json({
      data: psychologist
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });

  }
};
module.exports ={createProfile, updateProfile , getAllPsychologist, getPsychologistById,getMyProfile}
