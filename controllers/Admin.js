import asyncHandler from 'express-async-handler';
import Target from '../models/User.js';
import Contact from '../models/Contact.js';
import Event from '../models/Event.js';
import Join from '../models/Join.js';
import Office from '../models/Office.js';

const getAnalysis = asyncHandler(async (req, res) => {
  try {
    const contactAnalysis = {
      totalContacts: await Contact.countDocuments(),
      activeContacts: await Contact.countDocuments({ status: true }),
      inactiveContacts: await Contact.countDocuments({ status: false }),
    };

    const eventAnalysis = {
      totalEvents: await Event.countDocuments(),
      activeEvents: await Event.countDocuments({ archive: false }), // Only count where archive is false
      archivedEvents: await Event.countDocuments({ archive: true }),
      eventsWithUpdates: await Event.countDocuments({ updateStatus: true }),
      topOfficesWithMostEvents: await Event.aggregate([
        { $group: { _id: "$office", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "offices",
            localField: "_id",
            foreignField: "_id",
            as: "officeDetails"
          }
        },
        { $unwind: "$officeDetails" },
        { $project: { officeName: "$officeDetails.name", count: 1 } }
      ]),
    };

    const joinAnalysis = {
      totalJoins: await Join.countDocuments(),
      acceptedJoins: await Join.countDocuments({ status: true }),
      pendingJoins: await Join.countDocuments({ status: false }),
      topOfficesWithJoinRequests: await Join.aggregate([
        { $group: { _id: "$office", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "offices",
            localField: "_id",
            foreignField: "_id",
            as: "officeDetails"
          }
        },
        { $unwind: "$officeDetails" },
        { $project: { officeName: "$officeDetails.name", count: 1 } }
      ]),
    };

    const officeAnalysis = {
      totalOffices: await Office.countDocuments(),
      activeOffices: await Office.countDocuments({ status: true }),
      archivedOffices: await Office.countDocuments({ archive: true }),
      officesWithMostMembers: await Office.aggregate([
        { $project: {
          name: 1,
          allMembers: {
            $setUnion: [
              ["$president", "$vice", "$secretary"],
              "$poles.res",
              "$poles.members"
            ]
          }
        }
      },
      {
        $project: {
          name: 1,
          memberCount: { $size: "$allMembers" }
        }
      },
        { $sort: { memberCount: -1 } },
        { $limit: 5 }
      ]),
    };

    const userAnalysis = {
      totalUsers: await Target.countDocuments(),
      activeUsers: await Target.countDocuments({ status: true }),
      inactiveUsers: await Target.countDocuments({ status: false }),
      usersByRole: await Target.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),
      mostActiveUsers: await Office.aggregate([
        {
          $project: {
            allMembers: {
              $setUnion: [
                ["$president", "$vice", "$secretary"],
                "$poles.res",
                "$poles.members"
              ]
            }
          }
        },
        { $unwind: "$allMembers" },
        {
          $group: {
            _id: "$allMembers",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            userName: "$userDetails.username",
            count: 1
          }
        }
      ]),
    };

    const analysis = {
      contactAnalysis,
      eventAnalysis,
      joinAnalysis,
      officeAnalysis,
      userAnalysis,
    };

    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export {
  getAnalysis
};