import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './config/db.js';

// import data
import users from './data/users.js';
// import models
import User from './models/user.js';
import Team from './models/team.js';
import Client from './models/client.js';
import Project from './models/project.js';

dotenv.config({ path: './config/config.env' });

connectDB();

const importData = async () => {
  try {
    // await model.deleteMany(); .... repeat for all
    // await model.insertMany(data); ... repeat for all
    await User.insertMany(users);
    console.log(`Data imported`.green.inverse);
    process.exit(0);
  } catch (error) {
    console.log(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = (async) => {
  try {
    // await model.deleteMany(); .... repeat for all
    await User.deleteMany();
    await Client.deleteMany();
    await Project.deleteMany();
    await Team.deleteMany();

    console.log(`Data destroyed`.red.inverse);
    process.exit(0);
  } catch (error) {
    console.log(`${error}`.red.inverse);
    process.exit(1);
  }
};

process.argv[2] === '-d' ? destroyData() : importData();
