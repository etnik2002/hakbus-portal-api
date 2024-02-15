const jwt = require("jsonwebtoken");
const Ceo = require("../models/Ceo");
const mongoose = require("mongoose")

module.exports = {
    ceoAccessToken: async (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'] || req.headers.authorization; 
            if (!authHeader) {
                return res.status(401).json("No access here");
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json("No access here");
            }

            const user = jwt.verify(token, process.env.OUR_SECRET);
            try {
                if (user.data.role != 'ceo') {
                    return res.status(401).json("You don't have access here!");
                }
                next();
            } catch (error) {
                return res.status(401).json(`Error ncentrall`);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success:false, message: "tokeni ka mbaruar, behuni logout the pastaj login" });
        }
    },

    verifyCeoOrObsToken: async (req,res,next) =>{
        try {
            const authHeader = req.headers['authorization'] || req.headers.authorization; 
            if (!authHeader) {
                return res.status(401).json("No access here");
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json("No access here");
            }

            const user = jwt.verify(token, process.env.OUR_SECRET);
            try {
                if (user.data.role != 'ceo' && user.data.role != 'observer') {
                    console.log(user.data.role);
                    return res.status(401).json("You don't have access here!");
                }
                
                next();
            } catch (error) {
                return res.status(401).json(`Error ncentrall`);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success:false, message: "tokeni ka mbaruar, behuni logout the pastaj login" });
        }
    },
    
    verifyActiveAgent: async (req,res,next) => {
        try {
            const authHeader = req.headers['authorization']; 
            if (!authHeader) {
                return res.status(401).json("No access here");
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json("No access here");
            }

            const agent = jwt.verify(token, process.env.OUR_SECRET);
            if(!agent.data.isActive) {
                return res.status(403).json('Your account is currently deactivated. Please contact HakBus for reactivation.')
            }

            next();
        } catch (error) {
            console.log(error);
            return res.status(500).json("try again");
        }
    },

    verifyDeletionPin: async (req,res, next) => {
        try {
            const id = new mongoose.Types.ObjectId(req.body.userID)
            const ceo = await Ceo.find();
            console.log(ceo)
            if(ceo[0].deletionPin != req.body.pin && ceo[0]._id != req.body.userID) {
                return res.status(401).json("Wrong pin");
            }
            next();

        } catch (error) {
            console.log(error);
            return res.status(500).json("Internal Server Error");
        }
    },

    verifyAgentAccessToken: async (req,res,next) => {
        try {
            const authHeader = req.headers['authorization']; 
            if (!authHeader) {
                return res.status(401).json("No access here");
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json("No access here");
            }

            const agent = jwt.verify(token, process.env.OUR_SECRET);
            try {
                if (!agent) {
                    return res.status(401).json("You don't have access here!");
                }
                next();
            } catch (error) {
                return res.status(401).json(`Error ncentrall`);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json("Internal Server Error");
        }
    },

    getCeoAndAgency: async (req,res,next) => {
        try {
            console.log(req.headers)
            const agencyAuthHeader = req.headers['authorization']; 
            if (!agencyAuthHeader) {
                return res.status(401).json("No agent token found");
            }

            const agentToken = agencyAuthHeader.split(' ')[1];
            if (!agentToken) {
                return res.status(401).json("No agent token here");
            }

            const agent = jwt.verify(agentToken, process.env.OUR_SECRET);

            // const ceoAuthHeader = req.headers['ceo-authorization']; 
            // if (!ceoAuthHeader) {
            //     return res.status(401).json("No ceo token found");
            // }

            // const ceoToken = ceoAuthHeader.split(' ')[1];
            // if (!ceoToken) {
            //     return res.status(401).json("No ceo token here");
            // }

            // const ceo = jwt.verify(agentToken, process.env.OUR_SECRET);
            // req.ceo = ceo;
            req.agent = agent;
            next();
        } catch (error) {
            console.log(error);
            return res.status(500).json("Internal Server Error");
        }
    },

};
