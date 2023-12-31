import Profile from "../models/profile.js"
import User from "../models/user.js";
import fs from "fs";
import path, { resolve } from "path";

//get profile information
export const getProfileDetails = async (req, res) => {
    try {
        // console.log(req.user); 
        const userId = req.user.userId;

        //find user by id and populate the username and email fields
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        };

        //find the profile associated with the user
        const profile = await Profile.findOne({ user: userId });

        if (!profile) {
            const profile = new Profile({
                user: userId,
                username: user.username,
                email: user.email,
                patientId: user.patientId,
                age: "",
                gender: "Male",
                phone: "",
                address: "",
                profilePhoto: "",
            });
            await profile.save();
            return res.status(200).json({profile});
            //return res.status(404).json({ message: "Profile not found" });
        };
        const profileData = {
            username: user.username,
            email: user.email,
            patientId: user.patientId,
        };
        res.status(200).json({...profile.toJSON(), ...profileData});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    };
};

export const profileUpdate = async (req, res) => {
    try {
        const userId = req.user.userId;
        //console.log(userId);
        //console.log(req.body);

        const { age, gender, phone, address, profilePhoto } = req.body;

        //Find the profile associated with the user
        const profile = await Profile.findOne({ user: userId });
        //console.log(profile);
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        const __dirname = resolve();
        let updatedProfile = {
            age: age || profile.age,
            gender: gender || profile.gender,
            phone: phone || profile.phone,
            address: address || profile.address,
            profilePhoto: {
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename )),
                contentType: 'image/png'
            }
        };
        await profile.updateOne(updatedProfile, { _id: profile._id })
        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    };
}; 

export const deleteAllProfiles = async (req, res) => {
    try {
        // Delete all profiles
        const deletedProfiles = await Profile.deleteMany({});

        // Check if any profiles were deleted
        if (deletedProfiles.deletedCount === 0) {
            return res.status(404).json({ message: 'No profiles found to delete' });
        }

        return res.status(200).json({ message: 'Profiles deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
