const express = require('express')
const router = express.Router()
const User = require('./../models/user')
const {jwtAuthMiddleware, generateToken} = require('./../jwt')
//singup route
router.post('/signup',async(req, res)=>{
    try{
        const data = req.body
        const newUser = new User(data)
        const response = await newUser.save()
        console.log('data saved');
        const payload = {
            id: response.id
        }
        // console.log(JSON.stringify(payload))
        const token = generateToken(payload)
        // console.log('Token is ', token);
        res.status(200).json({response:response, token:token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'})
    }

})

//login route
router.post('/login', async(req, res)=>{
    try{
        const {aadharCardNumber, password} = req.body;
        // Check if aadharCardNumber or password is missing
        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
        }

        const user = await User.findOne({ aadharCardNumber: aadharCardNumber});
        if(!user || !(await user.comparePassword(password)))
        {
            return res.status(401).json({error: 'Invalid aadhar number or password'})
        }
        const payload={
            id:user.id,
            username:user.username
        }
        const token = generateToken(payload)
        res.json({token})
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:'Internal server error'})
    }
} )

//profile
router.get('/profile', jwtAuthMiddleware, async(req, res)=>{
    try{
        const userData = req.user
        const userId = userData.id
        const user = await User.findById(userId);
        res.status(200).json({user})
    }catch(err)
    {
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userId = req.user.id;
        const {currentPassword, newPassword} = req.body
        const user = await User.findById(userId);
        if(!(await user.comparePassword(newPassword)))
        {
            return res.status(401).json({error: 'Invalid aadhar number or password'})
        }
        user.password = newPassword;
        user.save();
        console.log('Password updated');
        res.status(200).json({message: 'Password updated'})
    }catch(err)
    {
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

module.exports = router