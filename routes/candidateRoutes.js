const express = require('express')
const router = express.Router()
const Candidate = require('./../models/candidate')
const User = require('./../models/user')
const {jwtAuthMiddleware, generateToken} = require('./../jwt')

//check admin role
const checkAdminRole = async(userId)=>{
    try{
        const user = await User.findById(userId);
        return user.role === 'admin';
    }catch(err)
    {
        return false;
    }
}
//POST route to add a candidate
router.post('/',jwtAuthMiddleware,async(req, res)=>{
    try{
        if(! (await checkAdminRole(req.user.id)))
        {
            return res.status(403).json({message: 'User is not an admin'})
        }
        const data = req.body
        const newCandidate = new Candidate(data)
        const response = await newCandidate.save()
        console.log('data saved');
        res.status(200).json({response:response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'})
    }

})

router.put('/:candidateId',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id))
        {
            return res.status(403).json({message: 'User is not an admin'})
        }
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new :true,
            runValidators: true
        })
        if(!response)
        {
            return res.status(404).json({error : 'Candidate not found'})
        }
        console.log('candidate data updated')
        res.status(200).json(response)
    }catch(err)
    {
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

router.delete('/:candidateId',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!(await checkAdminRole(req.user.id)))
        {
            return res.status(403).json({message: 'User is not an admin'})
        }
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;
        const response = await Candidate.findByIdAndDelete(candidateId);
        if(!response)
        {
            return res.status(404).json({error : 'Candidate not found'})
        }
        console.log('candidate deleted')
        res.status(200).json(response)
    }catch(err)
    {
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

// let's start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    // no admin can vote
    // user can only vote once

    candidateId = req.params.candidateID;
    userId = req.user.id;

    try{
        // Find the Candidate document with the specified candidateId
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.votesCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});

// vote count
router.get('/vote/count', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({votesCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.votesCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

//Route to view list of all candidates
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router