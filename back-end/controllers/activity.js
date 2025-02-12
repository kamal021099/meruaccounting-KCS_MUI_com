import Activity from "../models/activity.js";
import User from "../models/user.js";
import Project from "../models/project.js";
import Screenshot from "../models/screenshot.js";
import asyncHandler from "express-async-handler";
import dayjs from "dayjs";
import mongoose from "mongoose";

// @desc    Add a new screenshot
// @route   POST /activity/screenshot
// @access  Private

const createScreenShot = asyncHandler(async (req, res) => {
  const {
    consumeTime,
    clientId,
    projectId,
    task,
    image,
    activityAt,
    activityId,
    performanceData,
    title,
  } = req.body;

  const screenshot = await Screenshot.create({
    employee: req.user._id,
    client: clientId,
    project: projectId,
    task,
    consumeTime,
    image,
    activityAt: activityAt,
    activityId,
    performanceData,
    title,
  });

  if (screenshot) {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      res.status(404).json({ status: "no act found" });
    }
    activity.screenshots.push(screenshot._id.toHexString());
    await activity.save();

    res.status(201).json({
      status: "success",
      screenshot,
    });
  }
});

// @desc    Add a new activity
// @route   POST /activity
// @access  Private

const createActivity = asyncHandler(async (req, res) => {
  const {
    clientId,
    projectId,
    task,
    startTime,
    consumeTime,
    endTime,
    performanceData,
    isInternal,
    activityOn,
  } = req.body;

  const employeeId = req.body.employeeId ? req.body.employeeId : req.user._id;

  let today = activityOn ? activityOn : dayjs().format("DD/MM/YYYY");

  const activity = await Activity.create({
    employee: employeeId,
    client: clientId,
    project: projectId,
    task,
    performanceData,
    startTime,
    endTime,
    consumeTime,
    isInternal,
    activityOn: today,
  });

  if (activity) {
    const user = await User.findById(employeeId);
    let found = false;
    for (let i = 0; i < user.days.length; i++) {
      const day = user.days[i];
      if (day.date == today) {
        found = true;
        day.activities.push(activity);
        break;
      }
    }
    if (found == false) {
      const day = {
        date: today,
        activities: [activity],
      };
      user.days.push(day);
    }
    await user.save();
    res.status(201).json({
      status: "success",
      activity,
      days: user.days,
    });

    const project = await Project.findById(projectId);
    project.activities.push(activity);
    await project.save();
  } else {
    throw new Error("Internal server error");
  }
});

// @desc    Split a  activity
// @route   POST /activity
// @access  Private

const splitActivity = asyncHandler(async (req, res) => {
  const {
    activityId,
    clientId,
    projectId,
    task,
    // startTime,
    splitTime,
    // endTime,
    performanceData,
    isInternal,
  } = req.body;

  const intialActivity = await Activity.findById(activityId).populate(
    "screenshots"
  );

  const intitialActivityTime = parseInt(intialActivity.startTime);
  const finalActivityTime = intialActivity.endTime;
  const screenShots = intialActivity.screenshots;

  const activity1 = await Activity.create({
    employee: req.user._id,
    client: clientId,
    project: projectId,
    task,
    performanceData,
    startTime: intitialActivityTime,
    endTime: splitTime,
    isInternal,
  });
  const activity2 = await Activity.create({
    employee: req.user._id,
    client: clientId,
    project: projectId,
    task,
    performanceData,
    startTime: splitTime,
    endTime: finalActivityTime,
    isInternal,
  });

  if (activity1) {
    const user = await User.findById(req.user._id);

    let today = dayjs(intitialActivityTime).format("DD/MM/YYYY");

    let found = false;
    for (let i = 0; i < user.days.length; i++) {
      const day = user.days[i];
      if (day.date == today) {
        found = true;
        day.activities.push(activity1);
        break;
      }
    }
    if (found == false) {
      const day = {
        date: today,
        activities: [activity1],
      };
      user.days.push(day);
    }
    await user.save();
  } else {
    throw new Error("Internal server error");
  }
  if (activity2) {
    const user = await User.findById(req.user._id);

    let today = dayjs(intitialActivityTime).format("DD/MM/YYYY");

    let found = false;
    for (let i = 0; i < user.days.length; i++) {
      const day = user.days[i];

      if (day.date == today) {
        found = true;
        day.activities.push(activity2);
        break;
      }
    }
    if (found == false) {
      const day = {
        date: today,
        activities: [activity2],
      };
      user.days.push(day);
    }
    await user.save();
  } else {
    throw new Error("Internal server error");
  }
  screenShots.forEach((screenShot) => {
    const time = parseInt(screenShot.activityAt);
    let screenShotTime = new Date(time);
    let EndTime = parseInt(activity1.endTime);
    let endTime = new Date(EndTime);
    if (screenShotTime <= endTime) {
      activity1.screenshots.push(screenShot._id);
    } else {
      activity2.screenshots.push(screenShot._id);
    }
  });
  try {
    await activity1.save();
    await activity2.save();
    await Activity.findByIdAndRemove(activityId);
  } catch (error) {
    throw new Error("Sorry DataBase is Down");
  }

  res.status(200).json({
    status: "Activity Splitted Successfully",
  });
});

// @desc    Update the activity
// @route   PATCH /activity/:id
// @access  Private

const updateActivity = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { projectId } = req.body;
    // console.log(req.body);

    const activityId = req.params.id;
    const unUpdatedactivity = await Activity.findByIdAndUpdate(
      activityId,
      req.body
    );
    const activity = await Activity.findById(activityId);

    // get project time from aggregation
    const updateProjectTime = await Activity.aggregate([
      {
        $match: {
          project: mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $group: {
          _id: "$project",
          internal: {
            $sum: { $cond: ["$isInternal", "$consumeTime", 0] },
          },
          external: {
            $sum: { $cond: ["$isInternal", 0, "$consumeTime"] },
          },
          consumeTime: {
            $sum: "$consumeTime",
          },
        },
      },
    ]);
    const project = await Project.findByIdAndUpdate(
      { _id: projectId },
      {
        $set: {
          consumeTime: updateProjectTime[0].consumeTime,
          internal: updateProjectTime[0].internal,
          external: updateProjectTime[0].external,
        },
      },
      { multi: false }
    );
    // console.log(
    //   "🚀 ~ file: activity.js ~ line 261 ~ updateActivity ~ project",
    //   project
    // );

    // get the total time here from aggregation for user daily hours updatation
    const updateDailyTime = await Activity.aggregate([
      {
        $match: {
          employee: _id,
          activityOn: "23/02/2022",
        },
      },
      {
        $group: {
          _id: "$activityOn",
          consumeTime: {
            $sum: "$consumeTime",
          },
        },
      },
    ]);
    // updateDailyTime[0].consumeTime

    const user = await User.findByIdAndUpdate(
      { _id },
      { $set: { "days.$[elem].dailyHours": updateDailyTime[0].consumeTime } },
      {
        multi: false,
        arrayFilters: [{ "elem.date": { $eq: dayjs().format("DD/MM/YYYY") } }],
      }
    );
    // const user = await User.findByIdAndUpdate(
    //   { _id },
    //   { $inc: { "days.$[elem].dailyHours": req.body.newDailyHours } },
    //   {
    //     multi: false,
    //     arrayFilters: [{ "elem.date": { $eq: dayjs().format("DD/MM/YYYY") } }],
    //   }
    // );

    if (!unUpdatedactivity) {
      res.status(404);
      throw new Error(`No activity found ${activityId}`);
    }

    await user.save();

    res.status(202).json({
      message: "Succesfully edited activity",
      data: activity,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// @desc    Delete the screenshot
// @route   DELETE /activity/screenshot
// @access  Private

const deleteScreenshot = asyncHandler(async (req, res) => {
  try {
    const array = req.body;
    for (let i = 0; i < array.length; i++) {
      const screenshotId = array[i].screenshotId;
      const activityId = array[i].activityId;

      const screenshot = await Screenshot.findById(screenshotId);
      if (!screenshot) {
        res.status(404);
        throw new Error(`${screenshotId} not found`);
      }

      const delTime = screenshot.consumeTime ? screenshot.consumeTime : 0;

      const activity = await Activity.findById(activityId);
      if (!screenshot) {
        res.status(404);
        throw new Error(`${activityId} not found`);
      }

      activity.consumeTime = activity.consumeTime - delTime;
      activity.screenshots = activity.screenshots.filter(
        (_id) => _id.toHexString() !== screenshotId
      );
      await activity.save();

      await Screenshot.findByIdAndDelete(screenshotId);
    }
    res.status(200).json({
      status: "ok",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// @desc    Delete the activity
// @route   DELETE /activity
// @access  Private

const deleteActivity = asyncHandler(async (req, res) => {
  try {
    const { incomingDate, activityId } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, days: { $elemMatch: { date: incomingDate } } },
      {
        $pull: {
          "days.$.activities": activityId,
        },
      },
      { new: true, safe: true, upsert: true }
    );

    let activity = await Activity.findById(activityId);
    let projectId = activity.project;
    const project = await Project.findById(projectId);
    project.activities = project.activities.filter(
      (_id) => _id.toHexString() !== activityId
    );
    await project.save();

    if (!activity) {
      res.status(404);
      throw new Error("No activity found");
    }

    for (let j = 0; j < activity.screenshots.length; j++) {
      const ss = await Screenshot.findByIdAndDelete(activity.screenshots[j]);
    }

    activity = await Activity.findByIdAndDelete(activityId);

    res.status(200).json({
      status: "ok",
      data: user.days,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// @desc    Update the last active
// @route   POST /activity/lastActive
// @access  Private

const updateLastActive = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { lastActive } = req.body;

    const user = await User.findByIdAndUpdate(
      { _id },
      { lastActive: lastActive }
    );

    if (!user) {
      res.status(404);
      throw new Error("No such user found");
    }

    await user.save();

    res.status(202).json({
      message: "Succesfully edited last active",
      data: user.lastActive,
    });
  } catch (error) {
    throw new Error(error);
  }
});

export {
  createActivity,
  createScreenShot,
  updateActivity,
  splitActivity,
  deleteScreenshot,
  deleteActivity,
  updateLastActive,
};
